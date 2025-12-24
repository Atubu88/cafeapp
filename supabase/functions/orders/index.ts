import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

type OrderItemInput = {
  productId: string;
  quantity: number;
  price: number;
};

const encoder = new TextEncoder();

const toHex = (buffer: Uint8Array) =>
  Array.from(buffer)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');

const hmacSha256 = async (keyData: Uint8Array, data: Uint8Array) => {
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, data);
  return new Uint8Array(signature);
};

const validateTelegramInitData = async (initData: string, botToken: string) => {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');

  if (!hash) {
    return { valid: false, userId: null };
  }

  const dataCheckString = [...params.entries()]
    .filter(([key]) => key !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = await hmacSha256(
    encoder.encode('WebAppData'),
    encoder.encode(botToken)
  );
  const calculatedHash = await hmacSha256(secretKey, encoder.encode(dataCheckString));

  if (toHex(calculatedHash) !== hash) {
    return { valid: false, userId: null };
  }

  const userRaw = params.get('user');
  if (!userRaw) {
    return { valid: true, userId: null };
  }

  try {
    const user = JSON.parse(userRaw);
    return { valid: true, userId: user?.id ? String(user.id) : null };
  } catch {
    return { valid: true, userId: null };
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const items: OrderItemInput[] = body?.items ?? [];
    const status = body?.status ?? 'new';
    const source = body?.source ?? 'web';
    const initData: string | undefined = body?.initData;
    let tgUserId: string | null = body?.tgUserId ?? null;

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Empty order items' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (source === 'telegram' && !initData) {
      return new Response(JSON.stringify({ error: 'Missing initData' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (initData) {
      if (!telegramBotToken) {
        return new Response(JSON.stringify({ error: 'Telegram bot token missing' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const validation = await validateTelegramInitData(initData, telegramBotToken);
      if (!validation.valid) {
        return new Response(JSON.stringify({ error: 'Invalid initData' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!tgUserId && validation.userId) {
        tgUserId = validation.userId;
      }
    }

    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          total_price: totalPrice,
          status,
          source,
          tg_user_id: tgUserId,
        },
      ])
      .select()
      .single();

    if (orderError || !orderData) {
      return new Response(JSON.stringify({ error: 'Failed to create order' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const orderItems = items.map((item) => ({
      order_id: orderData.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      return new Response(JSON.stringify({ error: 'Failed to save order items' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ orderId: orderData.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

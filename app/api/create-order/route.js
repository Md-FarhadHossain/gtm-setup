import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { product, customerDetails, shippingInfo } = await request.json();

    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const orderKey = `wc_order_${Math.random().toString(36).substring(2, 15)}`;
    const total = product.price + shippingInfo.cost;

    const finalOrderData = {
      attributes: {
        date: new Date().toISOString(),
        order_number: orderNumber,
        order_key: orderKey,
        payment_method: "cod",
        payment_method_title: "ক্যাশ অন ডেলিভারি",
        shipping_method: shippingInfo.title,
        status: "processing",
        coupons: ""
      },
      totals: {
        currency: "BDT",
        shipping_total: shippingInfo.cost,
        total: total,
        subtotal: product.price,
      },
      customer: {
        billing: {
          first_name: customerDetails.firstName,
          last_name: customerDetails.lastName,
          address_1: customerDetails.address,
          city: customerDetails.city,
          state: customerDetails.state,
          postcode: customerDetails.postCode,
          country: customerDetails.country,
          email: customerDetails.email,
          phone: customerDetails.phone,
        }
      },
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          sku: product.id,
          price: product.price,
          item_category: product.category,
          quantity: 1,
          google_business_vertical: "retail",
          stockstatus: "instock",
        }
      ]
    };

    return NextResponse.json({ success: true, orderData: finalOrderData });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/rooms', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Deluxe Ocean View',
        type: 'deluxe',
        base_price: 299.99,
        capacity: 2,
        max_capacity: 3,
        room_number: '401',
        status: 'available'
      },
      {
        id: '2',
        name: 'Executive Suite',
        type: 'suite',
        base_price: 499.99,
        capacity: 2,
        max_capacity: 4,
        room_number: '501',
        status: 'occupied'
      }
    ]);
  }),

  http.get('*/bookings', () => {
    return HttpResponse.json([
      {
        id: '1',
        room_id: '1',
        customer: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        check_in_date: '2024-03-20',
        check_out_date: '2024-03-23',
        status: 'confirmed',
        total_price: 899.97
      }
    ]);
  }),

  http.post('*/bookings', async ({ request }) => {
    const booking = await request.json();
    return HttpResponse.json({
      id: '2',
      ...booking,
      status: 'confirmed',
      created_at: new Date().toISOString()
    });
  })
];
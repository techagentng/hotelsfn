import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomType, checkIn, checkOut } = req.body;

    // Validate input
    if (!roomType || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get auth token from request headers
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Call your backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const response = await fetch(`${backendUrl}/rooms/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        room_type: roomType,
        check_in_date: checkIn,
        check_out_date: checkOut,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.error || 'Failed to check availability',
      });
    }

    const data = await response.json();
    
    // Transform backend response to frontend format
    const availableRooms = (data.data || []).map((room: any) => ({
      id: room.id.toString(),
      number: room.room_number,
      type: room.room_type,
    }));

    return res.status(200).json({ availableRooms });
  } catch (error) {
    console.error('Error checking room availability:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

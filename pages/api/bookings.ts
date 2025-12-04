import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { status, startDate, endDate } = req.query;
      
      const where: any = {};
      
      if (status && status !== 'all') {
        where.status = status;
      }
      
      if (startDate && endDate) {
        where.AND = [
          { checkIn: { gte: new Date(startDate as string) } },
          { checkOut: { lte: new Date(endDate as string) } },
        ];
      }
      
      const bookings = await prisma.booking.findMany({
        where,
        include: {
          room: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.status(200).json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        guestName,
        guestEmail,
        guestPhone,
        roomType,
        checkIn,
        checkOut,
        guestCount,
        specialRequests,
      } = req.body;
      
      // Basic validation
      if (!guestName || !guestEmail || !roomType || !checkIn || !checkOut) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Check room availability
      const isAvailable = await checkRoomAvailability(roomType, checkIn, checkOut);
      
      if (!isAvailable) {
        return res.status(400).json({ message: 'Selected room type is not available for the selected dates' });
      }
      
      // Create booking
      const booking = await prisma.booking.create({
        data: {
          guestName,
          guestEmail,
          guestPhone: guestPhone || null,
          roomType,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          guestCount: parseInt(guestCount) || 1,
          specialRequests: specialRequests || null,
          status: 'confirmed',
          total: calculateTotal(roomType, checkIn, checkOut),
        },
      });
      
      // TODO: Send confirmation email
      
      res.status(201).json(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ message: 'Error creating booking' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function checkRoomAvailability(roomType: string, checkIn: string, checkOut: string): Promise<boolean> {
  const existingBookings = await prisma.booking.findMany({
    where: {
      roomType,
      OR: [
        {
          AND: [
            { checkIn: { lte: new Date(checkOut) } },
            { checkOut: { gte: new Date(checkIn) } },
          ],
        },
      ],
      status: { not: 'cancelled' },
    },
  });
  
  // Get total rooms of this type
  const roomCount = await prisma.room.count({
    where: { type: roomType },
  });
  
  return existingBookings.length < roomCount;
}

function calculateTotal(roomType: string, checkIn: string, checkOut: string): number {
  // Mock pricing - replace with your actual pricing logic
  const prices: Record<string, number> = {
    standard: 100,
    deluxe: 150,
    suite: 250,
  };
  
  const nights = Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return (prices[roomType] || 0) * nights;
}

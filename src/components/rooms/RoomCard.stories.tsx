import type { Meta, StoryObj } from '@storybook/react';
import RoomCard from './RoomCard';

const meta = {
  title: 'Components/RoomCard',
  component: RoomCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RoomCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {
  args: {
    room: {
      id: '1',
      hotel_id: 'hotel1',
      name: 'Deluxe Ocean View',
      type: 'deluxe',
      base_price: 299.99,
      capacity: 2,
      max_capacity: 3,
      floor_number: 4,
      room_number: '401',
      size_sqm: 45,
      status: 'available',
      description: 'Beautiful ocean view room',
      photos: [],
      smoking_allowed: false,
      pet_friendly: true,
      created_at: '2024-03-20T00:00:00Z',
      updated_at: '2024-03-20T00:00:00Z'
    },
    onEdit: () => console.log('Edit clicked'),
    onDelete: () => console.log('Delete clicked')
  },
};

export const Occupied: Story = {
  args: {
    room: {
      ...Available.args.room,
      status: 'occupied',
    },
    onEdit: Available.args.onEdit,
    onDelete: Available.args.onDelete
  },
};

export const Maintenance: Story = {
  args: {
    room: {
      ...Available.args.room,
      status: 'maintenance',
    },
    onEdit: Available.args.onEdit,
    onDelete: Available.args.onDelete
  },
};
import { render, screen, fireEvent } from '../../test/utils';
import RoomCard from './RoomCard';
import { Room } from '../../types';

const mockRoom: Room = {
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
};

describe('RoomCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders room details correctly', () => {
    render(
      <RoomCard
        room={mockRoom}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(mockRoom.name)).toBeInTheDocument();
    expect(screen.getByText(mockRoom.type, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(`$${mockRoom.base_price.toFixed(2)}/night`)).toBeInTheDocument();
    expect(screen.getByText(`Capacity: ${mockRoom.capacity} - ${mockRoom.max_capacity} guests`)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    render(
      <RoomCard
        room={mockRoom}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByTitle('Edit room');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('shows confirmation dialog before deletion', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    render(
      <RoomCard
        room={mockRoom}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTitle('Delete room');
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockOnDelete).toHaveBeenCalledTimes(1);

    confirmSpy.mockRestore();
  });

  it('displays room features correctly', () => {
    render(
      <RoomCard
        room={mockRoom}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    if (mockRoom.pet_friendly) {
      expect(screen.getByText('Pet Friendly')).toBeInTheDocument();
    }
    
    expect(screen.getByText(`Room ${mockRoom.room_number}`)).toBeInTheDocument();
    
    if (mockRoom.floor_number) {
      expect(screen.getByText(`Floor ${mockRoom.floor_number}`)).toBeInTheDocument();
    }
  });
});
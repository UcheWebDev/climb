# Snake & Ladders Multiplayer Game

A real-time multiplayer Snake & Ladders game built with React, TypeScript, and Supabase.

## Features

- 🎮 Real-time multiplayer gameplay
- 🐍 Dynamic snake and ladder positions
- 💬 In-game chat functionality
- 👥 Player presence tracking
- 🎯 Turn-based gameplay
- 🏆 Winner detection and celebration
- 📱 Responsive design

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd snakes
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_SUPABASE_FUNCTION_URL=your_supabase_function_url
```

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Create the required database tables:

```sql
-- Games table
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT UNIQUE NOT NULL,
  player1_id TEXT NOT NULL,
  player1_name TEXT NOT NULL,
  player2_id TEXT,
  player2_name TEXT,
  current_turn TEXT,
  player1_position INTEGER DEFAULT 1,
  player2_position INTEGER DEFAULT 1,
  player1_hits INTEGER DEFAULT 0,
  player2_hits INTEGER DEFAULT 0,
  dice_value INTEGER,
  is_rolling BOOLEAN DEFAULT FALSE,
  winner TEXT,
  snake_bite_points JSONB,
  success_points JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (for chat)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  user_id TEXT NOT NULL,
  token_id TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  liked_by TEXT[] DEFAULT '{}',
  reply_to UUID REFERENCES messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on games" ON games FOR ALL USING (true);
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);
```

3. Enable Realtime for the tables:
   - Go to your Supabase dashboard
   - Navigate to Database > Replication
   - Enable realtime for the `games` and `messages` tables

4. Get your project credentials:
   - Go to Settings > API
   - Copy the Project URL and anon public key
   - Update your `.env` file with these values

### Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:5173`

## How to Play

1. **Create a Game**: Enter your name and click "Create Game" to start a new game
2. **Share Room ID**: Share the generated room ID with a friend
3. **Join Game**: Your friend can enter their name and the room ID to join
4. **Take Turns**: Players take turns rolling the dice
5. **Snakes & Ladders**: Land on snakes to go down, ladders to go up
6. **Win**: First player to reach position 100 wins!

## Game Rules

- Players start at position 1
- Roll a 1 to start moving, or roll any number if already moving
- Snakes move you down to a lower position
- Ladders move you up to a higher position
- You must land exactly on 100 to win (overshooting doesn't count)
- Take turns rolling the dice

## Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Realtime, Auth)
- **Build Tool**: Vite
- **UI Components**: Custom components with Tailwind CSS
- **Animations**: CSS animations and React Confetti

## Project Structure

```
src/
├── components/
│   ├── Board.tsx              # Game board component
│   ├── ChatBox.tsx            # Chat functionality
│   ├── GameLayout.tsx         # Main game layout
│   ├── GameLobby.tsx          # Game lobby/join screen
│   ├── GameSkeleton.tsx       # Loading skeleton
│   └── Header.tsx             # App header
├── hooks/
│   ├── useSupabaseMultiplayer.ts  # Multiplayer game logic
│   └── useSupabaseRealtime.ts     # Chat functionality
└── App.tsx                    # Main app component
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 
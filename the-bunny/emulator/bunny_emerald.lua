--[[ ============================================================================
  THE BUNNY — Guiding Light overlay for Pokémon Emerald
  Follow the rabbit. See the Path. Always with choice.

  A non-destructive overlay: it READS the running game's memory (player position,
  current map, badge count), paints the Guiding Light on top, and — at the
  highest guidance level — can auto-walk the avatar toward the next waypoint.
  The ROM itself is never modified or shared. Use only with a ROM you legally own
  (dumped from your own cartridge).

  TARGET:  BizHawk (EmuHawk) with the mGBA core.  Lua console: Tools > Lua Console.
           (An mGBA-native port is a small change — ask and I'll add it.)
  ROM:     Pokémon Emerald (US/E v1.0). Addresses below are for that build.

  HOTKEYS (keyboard, while the emulator window is focused):
    G  — cycle guidance level: Dark → Glimmer → Path → Chord → Hand
    H  — toggle auto-walk (only acts at the "Hand" level)
    C  — capture the current tile as a waypoint (builds the route by walking it)
=============================================================================--]]

----------------------------------------------------------------------
-- CONFIG — Pokémon Emerald (US) memory map.
-- If the live readout (top-left) shows nonsense, verify these in a RAM Watch.
----------------------------------------------------------------------
local PTR_SAVEBLOCK1 = 0x03005D8C  -- gSaveBlock1Ptr -> points into EWRAM (0x02xxxxxx)
local OFF_X          = 0x00        -- s16  player X (map tile)
local OFF_Y          = 0x02        -- s16  player Y (map tile)
local OFF_MAPGROUP   = 0x04        -- u8   map group
local OFF_MAPNUM     = 0x05        -- u8   map number
local OFF_FLAGS      = 0x1270      -- flags array base (verify if badge count is wrong)
local FLAG_BADGE1    = 0x867       -- FLAG_BADGE01_GET; the 8 badges are consecutive flags

local WAYPOINT_FILE  = "bunny_waypoints_emerald.lua"  -- captured tiles append here

----------------------------------------------------------------------
-- The doctrine, in one line:
--   Guidance never gates reward. Choice is never removed.
-- (The score system lives in the desktop app; this overlay only shows the Path.)
----------------------------------------------------------------------
local L = { DARK = 0, GLIMMER = 1, PATH = 2, CHORD = 3, HAND = 4 }
local LEVEL_NAME = {
  [0] = "DARK  - no guide (full points still possible)",
  [1] = "GLIMMER - the next beat only",
  [2] = "PATH  - the chapter ahead + a side path",
  [3] = "CHORD - foresight & perspectives",
  [4] = "HAND  - the Guide can walk the Path",
}
local level    = L.PATH
local autoWalk = false

----------------------------------------------------------------------
-- THE SPINE — the main-story path, one chapter per badge tier.
-- Text guidance works with zero setup. The live arrow + auto-walk light up once
-- you've calibrated waypoints by walking (press C).
----------------------------------------------------------------------
local SPINE = {
  [0] = { gym = "STONE BADGE - Roxanne (Rustboro)", steps = {
      "Set the wall clock, head downstairs, talk to Mom.",
      "Visit the rival's house, then go north to Route 101.",
      "Save Prof. Birch - choose Treecko / Torchic / Mudkip and win.",
      "Get the Pokedex + 5 Poke Balls from Birch's Lab (Littleroot).",
      "Beat your rival on Route 103 (north of Oldale Town).",
      "Route 102 -> Petalburg City (meet Dad Norman; help Wally catch a Ralts).",
      "Route 104 -> Petalburg Woods (Devon researcher; an Aqua grunt) -> Rustboro.",
      "Rustboro Gym: beat Roxanne." },
      side = "SIDE: catch a full Route 101-104 dex; Rustboro's cuttable trees later." },
  [1] = { gym = "KNUCKLE BADGE - Brawly (Dewford)", steps = {
      "Chase the Devon Goods thief (Route 116 -> Rusturf Tunnel); return them to Devon.",
      "Take the Letter; Mr. Briney sails you to Dewford Town.",
      "Dewford Gym: beat Brawly.",
      "Granite Cave: deliver the Letter to Steven; grab HM05 Flash." },
      side = "SIDE: Dewford Trend (gossip) + the hidden items in Granite Cave." },
  [2] = { gym = "DYNAMO BADGE - Wattson (Mauville)", steps = {
      "Briney sails you to Slateport City; visit Capt. Stern at the Oceanic Museum.",
      "Route 110 -> Mauville City (battle the rival; the Trick House opens).",
      "Mauville Gym: beat Wattson.",
      "Optional now: New Mauville errand for Wattson." },
      side = "SIDE: the Trick House puzzles; the Game Corner; Cycling Road." },
  [3] = { gym = "HEAT BADGE - Flannery (Lavaridge)", steps = {
      "Routes 111/112 + Fiery Path -> Mt. Chimney.",
      "Stop Team Magma at the summit (Meteorite); ride the cable car.",
      "Lavaridge Town: use the hot-spring sand for an egg later.",
      "Lavaridge Gym: beat Flannery." },
      side = "SIDE: catch in the Fiery Path; the Mirage Tower / Root-Claw fossil." },
  [4] = { gym = "BALANCE BADGE - Norman (Petalburg)", steps = {
      "Return to Petalburg City; challenge your Dad.",
      "Petalburg Gym: beat Norman.",
      "Get HM03 Surf from Wally's uncle (Rustboro? no - Petalburg house) after." },
      side = "SIDE: with Surf, sweep back over every water tile you passed." },
  [5] = { gym = "FEATHER BADGE - Winona (Fortree)", steps = {
      "Route 118/119 -> the Weather Institute; stop Team Aqua (get Castform).",
      "Reach Fortree City; the Kecleon blocks the gym - get the Devon Scope (Route 120).",
      "Fortree Gym: beat Winona." },
      side = "SIDE: the secret-base spots along Route 119/120; Feebas tiles." },
  [6] = { gym = "MIND BADGE - Tate & Liza (Mossdeep)", steps = {
      "Route 120/121 -> Mt. Pyre (the Red & Blue Orbs storyline).",
      "Team Aqua/Magma hideouts; the orb is stolen; head toward Mossdeep.",
      "Mossdeep Gym: beat the twins Tate & Liza (double battle)." },
      side = "SIDE: the Space Center; Steven's house gift; Shoal Cave tides." },
  [7] = { gym = "RAIN BADGE - Juan (Sootopolis) -> ENDGAME", steps = {
      "Space Center: stop the launch plot; the awakened Kyogre/Groudon clash.",
      "Sootopolis erupts in chaos - go to the Cave of Origin; calm it (Rayquaza).",
      "Sootopolis Gym: beat Juan.",
      "Route 128 -> Seafloor Cavern done -> Victory Road -> the Elite Four & Champion." },
      side = "SIDE: catch Rayquaza (Sky Pillar); the Regis; rematches before the League." },
}

----------------------------------------------------------------------
-- WAYPOINTS — captured by walking. Key = "mapGroup:mapNum" -> list of {x,y,label}.
-- Loaded from WAYPOINT_FILE if it exists (the file the C hotkey writes to).
----------------------------------------------------------------------
local WAYPOINTS = {}
local function wpKey(g, n) return string.format("%d:%d", g, n) end
local function addWaypoint(g, n, x, y, label)
  local k = wpKey(g, n)
  WAYPOINTS[k] = WAYPOINTS[k] or {}
  table.insert(WAYPOINTS[k], { x = x, y = y, label = label or "wp" })
end
-- expose a loader fn name the capture file can call: WP("3:0", x, y, "label")
function WP(k, x, y, label)
  WAYPOINTS[k] = WAYPOINTS[k] or {}
  table.insert(WAYPOINTS[k], { x = x, y = y, label = label or "wp" })
end
do
  local ok, chunk = pcall(dofile, WAYPOINT_FILE)  -- silently ignored if missing
  if not ok then chunk = nil end
end

----------------------------------------------------------------------
-- MEMORY — read via the System Bus so absolute addresses just work.
----------------------------------------------------------------------
pcall(function() memory.usememorydomain("System Bus") end)
local function rd_u8(a)  return memory.read_u8(a)     end
local function rd_s16(a) return memory.read_s16_le(a) end
local function rd_u32(a) return memory.read_u32_le(a) end

-- bit n (0..7) of a byte, using arithmetic so it works on any Lua version
local function bitset(byte, n) return math.floor(byte / (2 ^ n)) % 2 == 1 end

local function readState()
  local p = rd_u32(PTR_SAVEBLOCK1)
  if p < 0x02000000 or p >= 0x02040000 then return nil end  -- save block not ready
  local s = {
    x        = rd_s16(p + OFF_X),
    y        = rd_s16(p + OFF_Y),
    mapGroup = rd_u8(p + OFF_MAPGROUP),
    mapNum   = rd_u8(p + OFF_MAPNUM),
  }
  local b = 0
  for i = 0, 7 do
    local fid  = FLAG_BADGE1 + i
    local byte = rd_u8(p + OFF_FLAGS + math.floor(fid / 8))
    if bitset(byte, fid % 8) then b = b + 1 end
  end
  s.badges = math.max(0, math.min(8, b))
  return s
end

----------------------------------------------------------------------
-- ROUTING — pick the chapter from badge count; pick the nearest waypoint here.
----------------------------------------------------------------------
local function nearestWaypoint(s)
  local list = WAYPOINTS[wpKey(s.mapGroup, s.mapNum)]
  if not list or #list == 0 then return nil end
  local best, bestD
  for _, w in ipairs(list) do
    local d = math.abs(w.x - s.x) + math.abs(w.y - s.y)  -- Manhattan, in tiles
    if d > 0 and (not bestD or d < bestD) then best, bestD = w, d end
  end
  return best, bestD
end

----------------------------------------------------------------------
-- AUTO-WALK — greedy axis walk toward a target tile, with stuck detection.
-- v1: good for open routes. Turn it OFF in menus/battles (it just presses D-pad).
----------------------------------------------------------------------
local lastPos, stillFrames, axisFlip = nil, 0, false
local function autoStep(s, target)
  local px = s.x .. "," .. s.y
  if px == lastPos then stillFrames = stillFrames + 1 else stillFrames = 0 end
  lastPos = px
  if stillFrames > 16 then axisFlip = not axisFlip; stillFrames = 0 end  -- try other axis

  local dx, dy = target.x - s.x, target.y - s.y
  local btn
  local preferX = (math.abs(dx) >= math.abs(dy)) ~= axisFlip
  if preferX and dx ~= 0 then
    btn = dx > 0 and "Right" or "Left"
  elseif dy ~= 0 then
    btn = dy > 0 and "Down" or "Up"
  elseif dx ~= 0 then
    btn = dx > 0 and "Right" or "Left"
  end
  if btn then joypad.set({ [btn] = true }, 1) end
end

----------------------------------------------------------------------
-- DRAW — the Guiding Light: a pulsing orb + a directional arrow + the HUD.
----------------------------------------------------------------------
local ARROW = { Right = {12,0}, Left = {-12,0}, Down = {0,12}, Up = {0,-12} }
local function dirToward(s, t)
  if math.abs(t.x - s.x) >= math.abs(t.y - s.y) then
    return (t.x > s.x) and "Right" or "Left"
  else
    return (t.y > s.y) and "Down" or "Up"
  end
end

local function draw(s)
  -- HUD (always shows raw reads so you can sanity-check the memory bridge)
  gui.text(4, 4,  "THE BUNNY  [" .. LEVEL_NAME[level] .. "]")
  gui.text(4, 22, string.format("map %d:%d  tile (%d,%d)  badges %d",
    s.mapGroup, s.mapNum, s.x, s.y, s.badges))

  if level == L.DARK then return end  -- the rabbit waits in the dark

  local chapter = SPINE[s.badges] or SPINE[7]
  gui.text(4, 40, ">> " .. chapter.gym)

  if level >= L.PATH then
    for i, step in ipairs(chapter.steps) do
      gui.text(4, 40 + i * 14, "  " .. i .. ". " .. step)
    end
  end
  if level >= L.CHORD and chapter.side then
    gui.text(4, 58 + #chapter.steps * 14, chapter.side)
  end

  -- the orb: a pulsing light that points to the nearest captured waypoint
  local w, d = nearestWaypoint(s)
  local cx, cy = 200, 30
  local pulse = 6 + 2 * math.abs(((emu.framecount() % 60) / 60) * 2 - 1)
  gui.drawEllipse(cx - pulse, cy - pulse, pulse * 2, pulse * 2, 0xFFFFE08A, 0x55FFE08A)
  if w then
    local dir = dirToward(s, w)
    local a = ARROW[dir]
    gui.drawLine(cx, cy, cx + a[1] * 1.5, cy + a[2] * 1.5, 0xFFFFFFFF)
    gui.text(150, 50, string.format("-> %s (%d tiles)", w.label, d))
  elseif level >= L.PATH then
    gui.text(120, 50, "press C to learn this area (then the orb guides)")
  end

  if level == L.HAND then
    gui.text(150, 64, autoWalk and "HAND: walking the Path (H to stop)"
                                or "HAND: press H to let the Guide walk")
  end
end

----------------------------------------------------------------------
-- HOTKEYS — keyboard, with edge detection so a press fires once.
----------------------------------------------------------------------
local prev = {}
local function edge(keys, name) return keys[name] and not prev[name] end

local function handleKeys(s)
  local keys = input.get()
  if edge(keys, "G") then level = (level + 1) % 5 end
  if edge(keys, "H") then autoWalk = not autoWalk end
  if edge(keys, "C") and s then
    addWaypoint(s.mapGroup, s.mapNum, s.x, s.y, "wp@" .. os.date("%H%M%S"))
    local f = io.open(WAYPOINT_FILE, "a")
    if f then
      f:write(string.format('WP("%d:%d", %d, %d, "wp")\n',
        s.mapGroup, s.mapNum, s.x, s.y))
      f:close()
    end
  end
  prev = keys
end

----------------------------------------------------------------------
-- THE LOOP — read, draw, (maybe) walk, advance one frame. Forever.
----------------------------------------------------------------------
while true do
  local s = readState()
  if s then
    handleKeys(s)
    draw(s)
    if level == L.HAND and autoWalk then
      local w = nearestWaypoint(s)
      if w then autoStep(s, w) end
    end
  else
    gui.text(4, 4, "THE BUNNY - waiting for save data (start/continue your game)")
    handleKeys(nil)
  end
  emu.frameadvance()
end

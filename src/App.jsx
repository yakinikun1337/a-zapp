import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DRINKS = {
  A: ["Aperol Spritz", "Apple Martini", "Amaretto Sour"],
  B: ["Beer", "Bangkok Buck", "Bloody Mary"],
  C: ["Chang Beer", "Caipirinha", "Cosmopolitan"],
  D: ["Daiquiri", "Dark & Stormy", "Draft Beer"],
  E: ["Espresso Martini", "Elderflower Spritz", "Electric Lemonade"],
  F: ["Fruit Shake + Rum", "Frozen Margarita", "French 75"],
  G: ["Gin & Tonic", "Gimlet", "Green Tea Shot"],
  H: ["Heineken", "Highball", "Hugo Spritz"],
  I: ["Irish Coffee", "Irish Whiskey", "Island Iced Tea"],
  J: ["Jägerbomb", "Jack & Coke", "Jungle Bird"],
  K: ["Kamikaze Shot", "Kir Royale", "Kiwi Mojito"],
  L: ["Long Island Iced Tea", "Lager", "Lemon Drop"],
  M: ["Mojito", "Margarita", "Mai Tai"],
  N: ["Negroni", "Nikka Highball", "New York Sour"],
  O: ["Old Fashioned", "Orange Vodka Soda", "Ouzo Shot"],
  P: ["Piña Colada", "Paloma", "Passionfruit Martini"],
  Q: ["Quick Shot", "Queen's Park Swizzle", "Quarantini"],
  R: ["Rum & Coke", "Red Bull Vodka", "Rosé"],
  S: ["SangSom & Soda", "Singha Beer", "Screwdriver"],
  T: ["Tequila Shot", "Tom Collins", "Thai Whiskey Soda"],
  U: ["Umeshu", "Umeshu Soda", "Unknown Bartender Pick"],
  V: ["Vodka Red Bull", "Vodka Soda", "Vietnamese Coffee Martini"],
  W: ["Whiskey Highball", "Whiskey Sour", "White Russian"],
  X: ["X.O. Cognac", "X-Rated Fusion Cocktail", "X Marks the Shot"],
  Y: ["Yuzu Cocktail", "Yuzu Highball", "Yellow Bird"],
  Z: ["Zombie", "Zesty Gin Fizz", "Zima-style Malt Drink"]
};

const CHALLENGES = [
  "Order the drink using only 5 words.",
  "Make a toast to Bangkok before drinking.",
  "Let your friend choose which drink option you take.",
  "Take a selfie with the drink before drinking.",
  "Ask the bartender for their recommendation for this letter.",
  "Speak in a fake luxury cocktail-review voice for 30 seconds.",
  "Compliment the bar, bartender, or music before ordering.",
  "Do a tiny victory dance before the first sip.",
  "Both players must guess the final price before ordering. Closest gets +5.",
  "Say cheers in Thai, then drink.",
  "Tell a 10-second fake origin story for this drink.",
  "Your friend chooses whether you sip or shoot this round.",
  "Pick the cheapest possible valid drink for this letter.",
  "Pick the fanciest possible valid drink for this letter.",
  "Find a drink menu item that no one has tried before.",
  "Use the drink name in a dramatic movie trailer voice.",
  "No phone until the drink is finished, except for scorekeeping.",
  "Describe the drink like a wine expert after the first sip.",
  "Before drinking, name one Bangkok memory from tonight.",
  "Rock, paper, scissors. Loser gets -5 unless they do a toast."
];

const DARES = [
  "Ask a stranger to pick between two drink options.",
  "Let your friend invent your next toast.",
  "Do karaoke for one line, quietly is fine.",
  "Trade seats with your friend for this round.",
  "Ask the bartender what the most Bangkok drink on the menu is.",
  "Speak only in questions until the drink arrives.",
  "Give your drink a ridiculous nickname.",
  "Let your friend choose one penalty card for you.",
  "Take the next photo like it is an album cover.",
  "Make a dramatic fake review: 10 seconds, maximum seriousness."
];

const PENALTIES = [
  { label: "Wrong drink", points: -10 },
  { label: "Spilled drink", points: -5 },
  { label: "Skipped letter", points: -15 },
  { label: "Failed challenge", points: -5 },
  { label: "Refused dare", points: -10 },
  { label: "Water break bonus", points: 5 },
  { label: "Food break bonus", points: 10 }
];

const LOCAL_BONUS_DRINKS = ["Chang Beer", "SangSom & Soda", "Singha Beer", "Thai Whiskey Soda"];

const PLAYERS_DEFAULT = [
  { name: "Player 1", score: 0 },
  { name: "Player 2", score: 0 }
];

function randomFrom(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error("randomFrom requires a non-empty array");
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomRound(usedLetters = [], noRepeatLetters = true) {
  const allLetters = Object.keys(DRINKS);
  const available = noRepeatLetters ? allLetters.filter((letter) => !usedLetters.includes(letter)) : allLetters;
  const letter = available.length ? randomFrom(available) : randomFrom(allLetters);

  return {
    letter,
    drink: randomFrom(DRINKS[letter]),
    challenge: randomFrom(CHALLENGES),
    dare: randomFrom(DARES),
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };
}

function calculateRoundScore(drink, bonus = 0) {
  const base = 10;
  const localBonus = LOCAL_BONUS_DRINKS.includes(drink) ? 7 : 0;
  const randomBonus = drink.includes("Unknown") || drink.includes("Quick") ? 10 : 0;
  return base + bonus + localBonus + randomBonus;
}

function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export default function App() {
  const [players, setPlayers] = useState(PLAYERS_DEFAULT);
  const [activePlayer, setActivePlayer] = useState(0);
  const [noRepeatLetters, setNoRepeatLetters] = useState(true);
  const [usedLetters, setUsedLetters] = useState([]);
  const [history, setHistory] = useState([]);
  const [round, setRound] = useState(() => getRandomRound([], true));
  const [mode, setMode] = useState("challenge");

  const usedCount = useMemo(() => new Set(usedLetters).size, [usedLetters]);
  const completedPercent = useMemo(() => Math.round((usedCount / 26) * 100), [usedCount]);
  const winner = useMemo(() => [...players].sort((a, b) => b.score - a.score)[0], [players]);

  const updateScore = (playerIndex, amount) => {
    setPlayers((prev) =>
      prev.map((player, idx) =>
        idx === playerIndex ? { ...player, score: player.score + amount } : player
      )
    );
  };

  const generateNextRound = (lettersAlreadyUsed = usedLetters, repeatSetting = noRepeatLetters) => {
    setRound(getRandomRound(lettersAlreadyUsed, repeatSetting));
    setMode(Math.random() > 0.75 ? "dare" : "challenge");
  };

  const completeRound = (bonus = 0) => {
    const currentPlayer = players[activePlayer];
    const total = calculateRoundScore(round.drink, bonus);
    const nextUsedLetters = Array.from(new Set([...usedLetters, round.letter]));

    updateScore(activePlayer, total);
    setUsedLetters(nextUsedLetters);
    setHistory((prev) => [{ ...round, player: currentPlayer.name, points: total, mode }, ...prev]);
    setActivePlayer((prev) => (prev + 1) % players.length);
    generateNextRound(nextUsedLetters, noRepeatLetters);
  };

  const resetGame = () => {
    setPlayers(PLAYERS_DEFAULT);
    setActivePlayer(0);
    setUsedLetters([]);
    setHistory([]);
    setRound(getRandomRound([], noRepeatLetters));
    setMode("challenge");
  };

  const renamePlayer = (idx, name) => {
    setPlayers((prev) =>
      prev.map((player, i) => (i === idx ? { ...player, name: name || `Player ${i + 1}` } : player))
    );
  };

  const toggleNoRepeatLetters = () => {
    const nextValue = !noRepeatLetters;
    setNoRepeatLetters(nextValue);
    generateNextRound(usedLetters, nextValue);
  };

  return (
    <main className="page">
      <div className="container">
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="hero">
          <div>
            <div className="badge">📍 Bangkok A-Z Night Game</div>
            <h1>Random Letter Drinking Scorecard</h1>
            <p>Random letters, Bangkok-friendly drinks, dares, challenges, points, penalties, and chaos.</p>
          </div>
          <Button variant="secondary" onClick={resetGame}>↻ Reset</Button>
        </motion.header>

        <div className="main-grid">
          <Card className="round-card">
            <div className="round-top">
              <div className="pill">Current turn: <strong>{players[activePlayer].name}</strong></div>
              <div className="pill">Completed: <strong>{usedCount}/26</strong> letters</div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${round.letter}-${round.drink}-${round.challenge}`}
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <div className="letter-row">
                  <div className="letter-box">{round.letter}</div>
                  <div>
                    <p className="eyebrow">Drink</p>
                    <h2>{round.drink}</h2>
                    <div className="time-pill">⏱️ Generated at {round.createdAt}</div>
                  </div>
                </div>

                <div className="challenge-grid">
                  <div className={`challenge-box ${mode === "challenge" ? "active-green" : ""}`}>
                    <p>Challenge</p>
                    <strong>{round.challenge}</strong>
                  </div>
                  <div className={`challenge-box ${mode === "dare" ? "active-pink" : ""}`}>
                    <p>Dare</p>
                    <strong>{round.dare}</strong>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="action-grid">
              <Button onClick={() => generateNextRound()}>🔀 New random</Button>
              <Button className="green" onClick={() => completeRound(0)}>✓ Complete +10</Button>
              <Button className="amber" onClick={() => completeRound(10)}>🏆 Bonus +20</Button>
              <Button variant="secondary" onClick={() => setMode(mode === "challenge" ? "dare" : "challenge")}>💀 Switch mode</Button>
            </div>
          </Card>

          <div className="side-column">
            <Card>
              <div className="card-header">
                <h3>Players</h3>
                <span>👥</span>
              </div>

              <div className="players">
                {players.map((player, idx) => (
                  <div key={idx} className={`player ${activePlayer === idx ? "active-player" : ""}`}>
                    <input
                      value={player.name}
                      onChange={(event) => renamePlayer(idx, event.target.value)}
                      aria-label={`Player ${idx + 1} name`}
                    />
                    <div className="score-row">
                      <span>{player.score}</span>
                      <div className="mini-buttons">
                        <button onClick={() => updateScore(idx, -5)} aria-label={`Subtract 5 points from ${player.name}`}>−</button>
                        <button onClick={() => updateScore(idx, 5)} aria-label={`Add 5 points to ${player.name}`}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="leader">Current leader: <strong>{winner.name}</strong></div>
            </Card>

            <Card>
              <h3>Game Settings</h3>
              <button onClick={toggleNoRepeatLetters} className={`setting ${noRepeatLetters ? "setting-on" : ""}`}>
                <strong>No repeat letters</strong>
                <span>{noRepeatLetters ? "On, each letter appears once" : "Off, letters can repeat"}</span>
              </button>
              <div className="progress"><div style={{ width: `${completedPercent}%` }} /></div>
              <p className="muted">A-Z progress: {completedPercent}%</p>
            </Card>
          </div>
        </div>

        <div className="bottom-grid">
          <Card>
            <h3>Quick Penalties & Bonuses</h3>
            <div className="penalties">
              {PENALTIES.map((penalty) => (
                <button key={penalty.label} onClick={() => updateScore(activePlayer, penalty.points)}>
                  <span>{penalty.label}</span>
                  <strong className={penalty.points > 0 ? "positive" : "negative"}>
                    {penalty.points > 0 ? `+${penalty.points}` : penalty.points}
                  </strong>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="card-header">
              <h3>Round History</h3>
              <span className="muted">Latest first</span>
            </div>

            <div className="history">
              {history.length === 0 ? (
                <div className="empty">No completed rounds yet.</div>
              ) : (
                history.map((item, idx) => (
                  <div key={`${item.letter}-${idx}`} className="history-item">
                    <div>
                      <strong>{item.letter}: {item.drink}</strong>
                      <p>{item.player} earned {item.points} points, {item.mode}</p>
                    </div>
                    <span>+{item.points}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <Card className="safety">
          Play safe: share drinks, drink water, eat food, skip rounds freely, and use taxis or rideshare. The goal is a funny Bangkok scorecard, not getting wrecked.
        </Card>
      </div>
    </main>
  );
}

(function (global) {
  'use strict';

  function shuffle(values) {
    const out = values.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function createEngine(participantIds) {
    const losses = {};
    participantIds.forEach((id) => {
      losses[id] = 0;
    });

    return {
      allParticipants: participantIds.slice(),
      wb: shuffle(participantIds),
      lb: [],
      nextWb: [],
      nextLb: [],
      pendingMatches: [],
      champion: null,
      losses,
      cycle: 0,
      nextMatchId: 1,
    };
  }

  function createMatch(engine, p1, p2, bracket, round) {
    const match = {
      id: engine.nextMatchId,
      p1,
      p2,
      bracket,
      round,
    };
    engine.nextMatchId += 1;
    return match;
  }

  function generateRoundMatches(engine) {
    while (engine.wb.length >= 2) {
      engine.pendingMatches.push(
        createMatch(
          engine,
          engine.wb.shift(),
          engine.wb.shift(),
          "Winner's Bracket",
          engine.cycle,
        ),
      );
    }

    while (engine.lb.length >= 2) {
      engine.pendingMatches.push(
        createMatch(
          engine,
          engine.lb.shift(),
          engine.lb.shift(),
          "Loser's Bracket",
          engine.cycle,
        ),
      );
    }
  }

  function getNextMatch(engine) {
    while (engine.pendingMatches.length === 0 && !engine.champion) {
      if (
        engine.wb.length === 0 &&
        engine.lb.length === 0 &&
        engine.nextWb.length === 1 &&
        engine.nextLb.length === 0
      ) {
        engine.champion = engine.nextWb[0];
        return null;
      }

      engine.wb.push(...engine.nextWb);
      engine.lb.push(...engine.nextLb);
      engine.nextWb = [];
      engine.nextLb = [];
      engine.cycle += 1;

      if (engine.wb.length === 1 && engine.lb.length === 1) {
        engine.pendingMatches.push(
          createMatch(
            engine,
            engine.wb.shift(),
            engine.lb.shift(),
            'Grand Finals',
            engine.cycle,
          ),
        );
        break;
      }

      generateRoundMatches(engine);

      while (engine.wb.length > 0) {
        engine.nextWb.push(engine.wb.shift());
      }
      while (engine.lb.length > 0) {
        engine.nextLb.push(engine.lb.shift());
      }
    }

    if (engine.pendingMatches.length > 0) {
      return engine.pendingMatches.shift();
    }
    return null;
  }

  function peekNextMatch(engine) {
    return engine.pendingMatches.length > 0 ? engine.pendingMatches[0] : null;
  }

  function recordWinner(engine, match, winnerId) {
    if (!match || (winnerId !== match.p1 && winnerId !== match.p2)) {
      throw new Error('Winner must be one of the racers in the current match.');
    }

    const loserId = winnerId === match.p1 ? match.p2 : match.p1;
    let event = 'win';

    if (match.bracket === "Winner's Bracket") {
      engine.losses[loserId] = (engine.losses[loserId] || 0) + 1;
      engine.nextWb.push(winnerId);
      engine.nextLb.push(loserId);
    } else if (match.bracket === "Loser's Bracket") {
      engine.losses[loserId] = (engine.losses[loserId] || 0) + 1;
      engine.nextLb.push(winnerId);
      event = 'elimination';
    } else if (match.bracket === 'Grand Finals') {
      if (winnerId === match.p1) {
        engine.losses[match.p2] = (engine.losses[match.p2] || 0) + 1;
        engine.champion = winnerId;
        event = 'champion';
      } else {
        engine.losses[match.p1] = (engine.losses[match.p1] || 0) + 1;
        engine.pendingMatches.push(
          createMatch(
            engine,
            match.p1,
            match.p2,
            'Grand Finals (Tiebreaker)',
            match.round + 1,
          ),
        );
        event = 'reset';
      }
    } else if (match.bracket === 'Grand Finals (Tiebreaker)') {
      engine.losses[loserId] = (engine.losses[loserId] || 0) + 1;
      engine.champion = winnerId;
      event = 'champion';
    }

    return { winnerId, loserId, event };
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  global.RegattaEngine = {
    createEngine,
    getNextMatch,
    peekNextMatch,
    recordWinner,
    deepClone,
  };
})(typeof window !== 'undefined' ? window : globalThis);

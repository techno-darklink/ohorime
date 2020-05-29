/* eslint-disable */
'use strict';

function calculatepoint(messages,  difficulty = 1.75) {
  const algos = {
    messages,
    difficulty,
  };
  algos.xp = algos.messages/1.25;
  algos.base = 100*algos.difficulty;
  algos.level = Math.ceil((algos.difficulty*algos.xp)/(algos.difficulty*algos.base));
  algos.next = algos.base*algos.level;
  algos.ratio = algos.xp/algos.next;
  return algos;
};

console.log(calculatepoint(880));
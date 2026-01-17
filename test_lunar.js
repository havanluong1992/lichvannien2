const { convertSolar2Lunar } = require('./lunar_node.js');

const result = convertSolar2Lunar(17, 1, 2026, 7);
console.log('Result for 17/01/2026:', result);

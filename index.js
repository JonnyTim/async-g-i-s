const fetch = global.fetch || require("node-fetch");
// const REGEX = /\["(\bhttps?:\/\/[^"]+)",(\d+),(\d+)\],null/g;
// REGEX for google image search results filtered by license
const REGEX_CCLICENSE = /\["(\bhttps?:\/\/[^"]+)",(\d+),(\d+)\],null,.*?\[null,".*?","https.*?","(.*?)",null,.*?\[(?:"\bhttps?:\/\/[^"]+"|null),"(\bhttps?:\/\/[^"]+)",.*?,(?:"(.*?)"|null),\d/g;
// REGEX for google image search results not filtered by license
const REGEX_NOLICENSE = /\["(\bhttps?:\/\/[^"]+)",(\d+),(\d+)\],null,.*?\[null,".*?","https.*?","(.*?)",null,.*?"(\bhttps?:\/\/[^"]+)",.*?,(?:"(.*?)"|null),\d.*?,\d.*?\],/g;
// REGEX for google image search results with function wrapper
const REGEX = /function\(\){var m=({.*?});var.*?}/s
/**
 * 
 * Async version of g-i-s module
 * @async
 * @param {String} searchTerm Search term to search
 * @param {Object} options Options for search
 * @param {Object} options.query You can use a custom query
 * @param {String} options.userAgent User agent for request
 * @returns {Promise<[{url: string, height: number, width: number }]>} Array of results
 */
module.exports = async function gis(searchTerm, options = {}) {
  if (!searchTerm || typeof searchTerm !== "string") throw new TypeError("searchTerm must be a string.");
  if (typeof options !== "object") throw new TypeError("options argument must be an object.");

  const {
    query = {},
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  } = options,
    body = await fetch(`http://www.google.com/search?${new URLSearchParams({ ...query, udm: "2", tbm: "isch", q: searchTerm })}`, {
      headers: {
        'User-Agent': userAgent,
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Connection': 'keep-alive',
      }
    }).then(res => res.text()),
    // content = body.slice(body.lastIndexOf("ds:1"), body.lastIndexOf("sideChannel")),
    content = body.slice(body.lastIndexOf("google.kEXPI")),
    // content = body,
    results = [];

  let result;
  let REGEX = REGEX_NOLICENSE;
  if (options.query && options.query.tbs) {
    REGEX = REGEX_CCLICENSE;
  }

  while (result = REGEX.exec(content))
    results.push({
      url: result[1],
      height: +result[2],
      width: +result[3],
      title: result[4],
      licenseurl: result[5],      
    });

  return results;
}
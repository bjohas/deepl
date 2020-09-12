#!/usr/bin/env node
'use strict';

const axios = require("axios");

const { ArgumentParser } = require('argparse');
const { version } = require('./package.json');
const shell = require("child_process");
const clipboardy = require('clipboardy');

var config = require('./config.json');
var apikey = config.apikey;

const parser = new ArgumentParser({
  description: 'DeepL API use.'
});

// https://www.deepl.com/docs-api/translating-text/
parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument("text", { help: "Text to be translated. (Required. Or use -u.)", nargs: '?'  });
parser.add_argument('-s','--source', { help: "Source language. One of: DE, EN-GB, EN-US, FR, IT, JA, ES, NL, PL, PT-PT, PT-BR, RU, ZH. Default: en. You can use lower case.", default: "" });
parser.add_argument('-t','--target', { help: "Target language. Same options as for source language. (Required.)" });
parser.add_argument('-f','--formality', { help: "Formality: default, more, less. For all languages except EN-GB, EN-US, ES, JA, ZH.", default: "default" });
parser.add_argument('--de', { help: "Translate to informal German.", action: 'store_true' });
parser.add_argument('--fr', { help: "Translate to informal French.", action: 'store_true' });
parser.add_argument('--pt', { help: "Translate to informal Portuguese.", action: 'store_true' });
parser.add_argument('--br', { help: "Translate to informal Brazilian.", action: 'store_true' });
parser.add_argument('-u','--usage', { help: "Get usage.", action: 'store_true' });
var arg = parser.parse_args();

if (arg["de"]) {
  arg["target"] = "DE";
  arg["formality"] = "less";
};

if (arg["br"]) {
  arg["target"] = "PT-BR";
  arg["formality"] = "less";
};

if (arg["pt"]) {
  arg["target"] = "PT-pt";
  arg["formality"] = "less";
};

if (arg["fr"]) {
  arg["target"] = "FR";
  arg["formality"] = "less";
};

if (!arg["text"] && !arg["usage"]) {
  console.log("TEXT is required");
  process.exit(1)
} else {
  // console.log("TARGET "+arg["target"]);    
};


if (!arg["target"] && !arg["usage"]) {
  console.log("--target TARGET is required");
  process.exit(1)
} else {
  // console.log("TARGET "+arg["target"]);    
};


function getDeepLURL(txt,from,to) {
  return "https://www.deepl.com/translator#"+from+"/" + to + "/" + encodeURIComponent(txt);
};

async function getDeepLUsage() {
  var url = "https://api.deepl.com/v2/usage?auth_key="+apikey
  try {
    var response = await axios.get(url);
    var data = response.data;
    var cost = data["character_count"]/500*0.01;
    var maxcost = data["character_limit"]/500*0.01;
    var str = "Character count = "+data["character_count"] + "\n"
	+ "Cost: €"+cost+"\n"
	+ "Character limit = "+data["character_limit"]+"\n"
	+ "Max cost: €"+maxcost;
    return str;
  } catch (error) {
    console.log(error);
  }    
};

async function translateTextDeepL(txt,from,to,formality) {
  var url = "https://api.deepl.com/v2/translate?auth_key="+apikey+
    "&source_lang="+from.toUpperCase()+"&target_lang="+to.toUpperCase()+"&formality="+formality+"&text="+encodeURIComponent(txt); 
  try {
    const response = await axios.get(url);
    const data = await response.data;    
    if ('translations' in data) {
      return data.translations[0].text;
    } else {
      return json;
    };
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  if (!arg["usage"]) {
    const text = await translateTextDeepL(arg["text"],arg["source"],arg["target"],arg["formality"]);
    console.log(text);
    clipboardy.writeSync(text);
  } else {
    const text = await getDeepLUsage();
    console.log(text);
  };
})();


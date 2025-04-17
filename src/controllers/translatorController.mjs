import { DICTIONARY_API_KEY } from '../../config/env.mjs';

export function getTranslator(req, res) {
  res.render('translator', { message: null });
}

export async function postTranslator(req, res, next) {
  try {
    const { word } = req.body;
    if (!word) return res.render('translator', { message: null });
    const url = `https://www.dictionaryapi.com/api/v3/references/spanish/json/${
      encodeURIComponent(word)
    }?key=${DICTIONARY_API_KEY}`;
    const response = await fetch(url);
    const data     = await response.json();
    const translation = data?.[0]?.shortdef || ['No translation found'];
    res.render('translator', { message: translation });
  } catch (e) {
    next(e);
  }
}
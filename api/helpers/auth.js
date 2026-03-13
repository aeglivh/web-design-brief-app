'use strict';

async function getUser(req) {
  const supabase = require('../lib/supabase');
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

module.exports = { getUser };

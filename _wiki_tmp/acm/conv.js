// md -> Flow 위키(Tiptap) JSON. 제목, 중첩 목록(2칸 들여쓰기), 번호 목록, 표, 인용, **굵게**, `코드`를 다룬다.
(function () {
  const inline = (s) => {
    const out = [];
    const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let last = 0, m;
    while ((m = re.exec(s))) {
      if (m.index > last) out.push({ type: 'text', text: s.slice(last, m.index) });
      const tok = m[0];
      if (tok.startsWith('**')) out.push({ type: 'text', marks: [{ type: 'bold' }], text: tok.slice(2, -2) });
      else out.push({ type: 'text', marks: [{ type: 'code' }], text: tok.slice(1, -1) });
      last = m.index + tok.length;
    }
    if (last < s.length) out.push({ type: 'text', text: s.slice(last) });
    return out.filter(n => n.text);
  };
  const P = (s) => ({ type: 'paragraph', attrs: { indent: 0, textAlign: null }, content: inline(s) });
  const H = (l, s) => ({ type: 'heading', attrs: { indent: 0, textAlign: null, level: Math.min(l, 6) }, content: inline(s) });
  const cell = (tp, s) => ({ type: tp, attrs: { colspan: 1, rowspan: 1, colwidth: [200], textAlign: null, background: null }, content: [P(s.replace(/<br>/g, ' / '))] });
  const listRe = /^(\s*)(- |\d+\. )(.*)$/;
  function parseList(lines, i, indent) {
    const first = lines[i].match(listRe);
    const ordered = /\d+\. /.test(first[2]);
    const list = ordered ? { type: 'orderedList', attrs: { start: 1 }, content: [] } : { type: 'bulletList', attrs: { tight: false }, content: [] };
    while (i < lines.length) {
      const m = lines[i].match(listRe);
      if (!m) break;
      const ind = m[1].length;
      if (ind < indent) break;
      if (ind > indent) {
        const last = list.content[list.content.length - 1];
        const r = parseList(lines, i, ind);
        last.content.push(r.node);
        i = r.i;
        continue;
      }
      if (/\d+\. /.test(m[2]) !== ordered) break;
      list.content.push({ type: 'listItem', content: [P(m[3])] });
      i++;
    }
    return { node: list, i };
  }
  window.mdToDoc = function (md) {
    const lines = md.replace(/\r/g, '').split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const L = lines[i];
      if (!L.trim()) { i++; continue; }
      const h = L.match(/^(#{1,6}) (.*)$/);
      if (h) { out.push(H(h[1].length, h[2])); i++; continue; }
      if (listRe.test(L)) { const r = parseList(lines, i, L.match(listRe)[1].length); out.push(r.node); i = r.i; continue; }
      if (L.startsWith('|')) {
        const rows = [];
        while (i < lines.length && lines[i].startsWith('|')) {
          if (!/^\|[-| :]+\|$/.test(lines[i])) rows.push(lines[i].slice(1, -1).split('|').map(s => s.trim()));
          i++;
        }
        out.push({ type: 'table', attrs: { height: null, width: null }, content: rows.map((r, ri) => ({ type: 'tableRow', content: r.map(c => cell(ri === 0 ? 'tableHeader' : 'tableCell', c)) })) });
        continue;
      }
      if (L.startsWith('> ')) { out.push(P(L.slice(2))); i++; continue; }
      out.push(P(L.trim()));
      i++;
    }
    return out;
  };
})();

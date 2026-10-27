import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/** Rumus LaTeX statis (isi selalu dari kode kita sendiri, bukan input pengguna). */
export const Tex: React.FC<{ children: string; block?: boolean; className?: string }> = ({ children, block = false, className = '' }) => {
  const html = useMemo(
    // Koma desimal ("2,85") dibungkus {,} agar KaTeX tidak menambah spasi setelahnya
    () => katex.renderToString(children.replace(/(\d),(\d)/g, '$1{,}$2'), { displayMode: block, throwOnError: false, strict: false }),
    [children, block]
  );
  const Tag = block ? 'div' : 'span';
  return <Tag className={`${block ? 'overflow-x-auto py-1' : ''} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
};

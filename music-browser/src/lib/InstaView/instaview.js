/*
    Copyright © 2013 C. Scott Ananian

    Copyright © 2005-2006 Pedro Fayolle

    Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

        1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

        2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the
           documentation and/or other materials provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
    PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
    NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
    This file has been modified to specifically transform wikitext supported by MusicBrainz to HTML. It has also been updated to use modern JavaScript
    syntax and patterns. The 'InstaView' object is the main entry point to the conversion functionality. It can be imported using regular ESM syntax.
*/

'use strict';

import namespace_langs from './namespace_langs.js';

const InstaView = {}

InstaView.conf = {
	user: {},

	wiki: {
		lang: 'en',
		interwiki: 'ab|aa|af|ak|sq|als|am|ang|ar|an|arc|hy|roa-rup|as|ast|av|ay|az|bm|ba|eu|be|bn|bh|bi|bs|br|bg|my|ca|ch|ce|chr|chy|ny|zh|zh-tw|zh-cn|cho|cv|kw|co|cr|hr|cs|da|dv|nl|dz|en|eo|et|ee|fo|fj|fi|fr|fy|ff|gl|ka|de|got|el|kl|gn|gu|ht|ha|haw|he|hz|hi|ho|hu|is|io|ig|id|ia|ie|iu|ik|ga|it|ja|jv|kn|kr|csb|ks|kk|km|ki|rw|rn|tlh|kv|kg|ko|kj|ku|ky|lo|la|lv|li|ln|lt|jbo|nds|lg|lb|mk|mg|ms|ml|mt|gv|mi|minnan|mr|mh|zh-min-nan|mo|mn|mus|nah|na|nv|ne|se|no|nn|oc|or|om|pi|fa|pl|pt|pa|ps|qu|ro|rm|ru|sm|sg|sa|sc|gd|sr|sh|st|tn|sn|scn|simple|sd|si|sk|sl|so|st|es|su|sw|ss|sv|tl|ty|tg|ta|tt|te|th|bo|ti|tpi|to|tokipona|ts|tum|tr|tk|tw|uk|ur|ug|uz|ve|vi|vo|wa|cy|wo|xh|ii|yi|yo|za|zu',
		default_thumb_width: 180
	},

	paths: {
		base_href: '/',
		articles: '/wiki/',
		math: '/math/',
		images: '',
		images_fallback: 'http://upload.wikimedia.org/wikipedia/commons/',
		magnify_icon: 'skins/common/images/magnify-clip.png'
	},

	locale: {
		user: 'User',
		image: 'Image',
		category: 'Category',
		months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
	}
};

// Set options with default values
(function (conf) {
    const user = conf.user;
	const locale = conf.locale;
	const paths = conf.paths;
	const wiki = conf.wiki;

    user.name = user.name || 'Wikipedian'
    user.signature = '[['+locale.user+':'+user.name+'|'+user.name+']]'

    if (typeof location === 'object') {
		paths.base_href = location;
	}

    paths.images = 'http://upload.wikimedia.org/wikipedia/' + wiki.lang + '/';

    // Generate a list of interwiki link prefixes from keys in namespace_langs
    const langs = [];

    for (const lang in namespace_langs) {
        if (Object.prototype.hasOwnProperty.call(namespace_langs, lang)) {
            langs.push(lang);
        }
    }

    wiki.interwiki = langs.join('|');
})(InstaView.conf);

InstaView.BLOCK_IMAGE = new RegExp('^\\[\\['+InstaView.conf.locale.image+':.*?\\|.*?(?:frame|thumbnail|thumb|none|right|left|center)', 'i');

InstaView.dump = function (from, to) {
	if (typeof from === 'string') {
		from = document.getElementById(from);
	}

	if (typeof to === 'string') {
		to = document.getElementById(to);
	}

	to.innerHTML = this.convert(from.value)
}

InstaView.convert = function (wiki) {
	// Holds a list of the lines of wikitext being processed
	let	ll = (typeof wiki === 'string') ? wiki.replace(/\r/g,'').split(/\n/) : wiki;

	let o = '';  // Output
	let p = 0;  // Para flag
	let $r;	 // Result of passing a regexp to $()

	function remain() {
		return ll.length;
	}

	function sh() {
		return ll.shift();
	}

	function ps(s) {
		o += s;
	}

	// Similar to C's printf, uses ? as placeholders, ?? to escape question marks
	function f() {
		let i = 1;
		let a = arguments;
		let f = a[0];
		let o = '';
		let c;
		let p;

		for (;i < a.length; i++) {
			if ((p = f.indexOf('?')) + 1) {
				// Allow character escaping
				i -= c=f.charAt(p+1) === '?' ? 1 : 0;
				o += f.substring(0, p) + (c ? '?' : a[i]);

				f=f.substring(p + 1 + c);
			} else {
				break;
			}
		}

		return o + f;
	}

	function html_entities(s) {
		return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
	}

	function min(a, b) {
		return (a < b) ? a : b;
	}

	// Return the first non-matching character position between two strings
	function str_imatch(a, b) {
		const l = min(a.length, b.length);
		let i;

		for (i = 0; i < l; i++) {
			if (a.charAt(i) !== b.charAt(i)) {
				break;
			}
		}

		return i;
	}

	// Compare current line against a string or regexp. If passed a string it will compare only the first string.length characters. If passed a regexp
	// the result is stored in $r.
	function $(c) {
		return (typeof c === 'string') ? (ll[0].substring(0, c.length) === c) : ($r = ll[0].match(c));
	}

	// Compare the current line against a string
	function $$(c) {
		return ll[0] === c;
	}

	function _(p) {
		return ll[0].charAt(p);
	}

	function endl(s) {
		ps(s);
		sh();
	}

	function parse_list() {
		let prev = '';

		while (remain() && $(/^( {4}[*#:;]+)(.*)$/)) {
			const l_match = $r;

			sh();

			const ipos = str_imatch(prev, l_match[1])

			// Close uncontinued lists
			for (let i = prev.length - 1; i >= ipos; i--) {
				const pi = prev.charAt(i);

				if (pi === '*') {
					ps('</ul>');
				} else if (pi === '#') {
					ps('</ol>');
				}
				else {
					// Close a dl only if the new item is not a dl item (:, ; or empty)
					switch (l_match[1].charAt(i)) {
						case '':
                        case '*':
						case '#':
							ps('</dl>');
					}
				}
			}

			// Open new lists
			for (let i = ipos; i < l_match[1].length; i++) {
				const li = l_match[1].charAt(i);

				if (li === '*') {
					ps('<ul>')
				} else if (li === '#') {
					ps('<ol>')
				} else {
					// Open a new dl only if the prev item is not a dl item (:, ; or empty)
					switch(prev.charAt(i)) {
						case'':
						case'*':
						case'#':
							ps('<dl>');
					}
				}
			}

			switch (l_match[1].charAt(l_match[1].length - 1)) {
				case '*':
				case '#':
					ps('<li>' + parse_inline_nowiki(l_match[2]));
					break;
				case ';':
					ps('<dt>');

					let dt_match = l_match[2].match(/(.*?) (:.*?)$/);

					// Handle ;dt :dd format
					if (dt_match) {
						ps(parse_inline_nowiki(dt_match[1]));
						ll.unshift(dt_match[2]);
					} else {
						ps(parse_inline_nowiki(l_match[2]))
					}

					break;
				case ':':
					ps('<dd>' + parse_inline_nowiki(l_match[2]));
			}

			prev = l_match[1];
		}

		// Close remaining lists
		for (let i = prev.length-1; i >= 0; i--){
			ps(f('</?>', (prev.charAt(i) === '*')? 'ul': ((prev.charAt(i) === '#') ? 'ol' : 'dl')));
		}
	}

	function parse_table() {
		endl(f('<table?>', $(/^\{\|( .*)$/)? $r[1]: ''));

		for (; remain();) {
			if ($('|')) {
				switch (_(1)) {
					case '}':
						endl('</table>');
						return;
					case '-':
						endl(f('<tr ?>', $(/\|-*(.*)/)[1]));
						break;
					default:
						parse_table_data();
				}
			}
			else if ($('!')) {
				parse_table_data();
			} else {
				sh();
			}
		}
	}

	function parse_table_data()
	{
		let td_line;
		let match_i;

		// 1: "|+", '|' or '+'
		// 2: ??
		// 3: attributes ??
		const td_match = sh().match(/^(\|\+|\||!)((?:([^[|]*?)\|(?!\|))?(.*))$/);

		if (td_match[1] === '|+') {
			ps('<caption');
		} else {
			ps('<t' + ((td_match[1] === '|')?'d':'h'));
		}

		if (typeof td_match[3] != 'undefined') {
			ps(' ' + td_match[3]);
			match_i = 4;
		} else {
			match_i = 2;
		}

		ps('>');

		if (td_match[1] !== '|+') {
			// Use || or !! as a cell separator depending on context. Note: when split() is passed a regexp make sure to use non-capturing brackets.
			td_line = td_match[match_i].split((td_match[1] === '|')? '||': /(?:\|\||!!)/)

			ps(parse_inline_nowiki(td_line.shift()));

			while (td_line.length) {
				ll.unshift(td_match[1] + td_line.pop());
			}
		} else {
			ps(td_match[match_i]);
		}

		let tc = 0;
		const td = [];

		for (; remain(); td.push(sh())) {
			if ($('|')) {
				if (!tc) {
					break;
				} else if (_(1) === '}') {
					// We're at the outermost level (no nested tables), skip to td parse
					tc--;
				}
			} else if (!tc && $('!')) {
				break;
			} else if ($('{|')) {
				tc++;
			}
		}

		if (td.length) {
			ps(InstaView.convert(td));
		}
	}

	function parse_pre() {
		ps('<pre>');

		do {
			endl(parse_inline_nowiki(ll[0].substring(1)) + "\n");
		} while (remain() && $(' '))

		ps('</pre>');
	}

	function parse_block_image() {
		ps(parse_image(sh()));
	}

	function parse_image(str) {
		// Get what's in between "[[Image:" and "]]"
		let tag = str.substring(InstaView.conf.locale.image.length + 3, str.length - 2);

		let width;
		let attr = [];
		let filename;
		let caption = '';
		let thumb = 0;
		let frame = 0;
		let center = 0;
		let align = '';

		if (tag.match(/\|/)) {
			// Manage nested links
			let nesting = 0;
			let last_attr;

			for (let i = tag.length-1; i > 0; i--) {
				if (tag.charAt(i) === '|' && !nesting) {
					last_attr = tag.substring(i + 1);
					tag = tag.substring(0, i);
					break;
				} else switch (tag.substring(i-1, 2)) {
					case ']]':
						nesting++;
						i--;
						break;
					case '[[':
						nesting--;
						i--;
				}
			}

			attr = tag.split(/\s*\|\s*/);
			attr.push(last_attr);
			filename = attr.shift();

			let w_match;

			for (; attr.length; attr.shift()) {
				w_match = attr[0].match(/^(\d*)px$/);

				if (w_match) {
					width = w_match[1]
				} else {
					switch(attr[0]) {
						case 'thumb':
						case 'thumbnail':
							thumb=true;
							frame=true;

							break;
						case 'frame':
							frame=true;

							break;
						case 'none':
						case 'right':
						case 'left':
							center=false;
							align=attr[0];

							break;
						case 'center':
							center=true;
							align='none';

							break;
						default:
							if (attr.length === 1) {
								caption = attr[0];
							}
					}
				}
			}
		} else {
			filename = tag;
		}

		let o = '';

		if (frame) {
			if (align === '') {
				align = 'right';
			}

			o += f("<div class='thumb t?'>", align);

			if (thumb) {
				if (!width) {
					width = InstaView.conf.wiki.default_thumb_width;
				}

				o += f("<div style='width:?px;'>?", 2+width*1, make_image(filename, caption, width)) +
					f("<div class='thumbcaption'><div class='magnify' style='float:right'><a href='?' class='internal' title='Enlarge'><img src='?'></a></div>?</div>",
						InstaView.conf.paths.articles + InstaView.conf.locale.image + ':' + filename,
						InstaView.conf.paths.magnify_icon,
						parse_inline_nowiki(caption)
					);
			} else {
				o += '<div>' + make_image(filename, caption) + f("<div class='thumbcaption'>?</div>", parse_inline_nowiki(caption));
			}

			o += '</div></div>';
		} else if (align !== '') {
			o += f("<div class='float?'><span>?</span></div>", align, make_image(filename, caption, width));
		} else {
			return make_image(filename, caption, width);
		}

		return center? f("<div class='center'>?</div>", o): o;
	}

	function parse_inline_nowiki(str)
	{
		let start;
		let lastend = 0;
		let substart = 0;
		let nestlev = 0;
		let open;
		let close;
		let subloop;
		let html = '';

		while (-1 !== (start = str.indexOf('<nowiki>', substart))) {
			html += parse_inline_wiki(str.substring(lastend, start));
			start += 8;
			substart = start;
			subloop = true;

			do {
				open = str.indexOf('<nowiki>', substart);
				close = str.indexOf('</nowiki>', substart);

				if (close <= open || open === -1) {
					if (close === -1) {
						return html + html_entities(str.substring(start));
					}

					substart = close + 9;

					if (nestlev) {
						nestlev--;
					} else {
						lastend = substart;
						html += html_entities(str.substring(start, lastend-9));
						subloop = false;
					}
				} else {
					substart = open + 8;
					nestlev++;
				}
			} while (subloop)
		}

		return html + parse_inline_wiki(str.substring(lastend));
	}

	function make_image(filename, caption, width) {
		// Uppercase first letter in the file name
		filename = filename.charAt(0).toUpperCase() + filename.substring(1);

		// Replace spaces with underscores
		filename = filename.replace(/ /g, '_');

		caption = strip_inline_wiki(caption);

		const md5 = hex_md5(filename);
		const source = md5.charAt(0) + '/' + md5.substring(0, 2) + '/' + filename;

		if (width) {
			width = "width='" + width + "px'";
		}

		const img = f("<img onerror=\"this.onerror=null;this.src='?'\" src='?' ? ?>", InstaView.conf.paths.images_fallback + source, InstaView.conf.paths.images + source, (caption !== '')? "alt='" + caption + "'" : '', width);

		return f("<a class='image' ? href='?'>?</a>", (caption !== '') ? "title='" + caption + "'" : '', InstaView.conf.paths.articles + InstaView.conf.locale.image + ':' + filename, img);
	}

	function parse_inline_images(str)
	{
		let start;
		let substart = 0;
		let nestlev = 0;
		let loop;
		let close;
		let open;
		let wiki;
		let html;

		while (-1 !== (start = str.indexOf('[[', substart))) {
			if (str.substring(start + 2).match(RegExp('^' + InstaView.conf.locale.image + ':','i'))) {
				loop = true;
				substart = start;

				do {
					substart += 2;
					close = str.indexOf(']]',substart);
					open = str.indexOf('[[',substart);

					if (close <= open || open === -1) {
						if (close === -1) {
							return str;
						}

						substart=close;

						if (nestlev) {
							nestlev--;
						} else {
							wiki = str.substring(start,close+2);
							html = parse_image(wiki);

							str = str.replace(wiki, html);
							substart = start + html.length;
							loop = false;
						}
					} else {
						substart = open;
						nestlev++;
					}
				} while (loop)
			} else {
				break;
			}
		}

		return str;
	}

	// The output of this function doesn't respect the FILO structure of HTML but most browsers can handle it.
	function parse_inline_formatting(str)
	{
		let em;
		let st;
		let i;
		let li;
		let o = '';

		while ((i = str.indexOf("''",li)) + 1) {
			o += str.substring(li, i);
			li = i + 2;

			if (str.charAt(i + 2) === "'") {
				li++;
				st = !st;
				o += st ? '<strong>' : '</strong>';
			} else {
				em = !em;
				o += em ? '<em>' : '</em>';
			}
		}

		return o + str.substring(li);
	}

	function parse_inline_wiki(inputStr)
	{
		let str = parse_inline_images(inputStr);
		str = parse_inline_formatting(str);

		let aux_match;

		// Math
		while (aux_match = str.match(/<(?:)math>(.*?)<\/math>/i)) {
			const math_md5 = hex_md5(aux_match[1]);
			str = str.replace(aux_match[0], f("<img src='?.png'>", InstaView.conf.paths.math + math_md5));
		}

		// Build a Mediawiki-formatted date string
		const date = new Date;
		let minutes = date.getUTCMinutes();

		if (minutes < 10) {
			minutes = '0' + minutes;
		}

		const newDate = f("?:?, ? ? ? (UTC)", date.getUTCHours(), minutes, date.getUTCDate(), InstaView.conf.locale.months[date.getUTCMonth()], date.getUTCFullYear());

		// Text formatting
		return str.trim().
			// Signatures
			replace(/~{5}(?!~)/g, newDate).
			replace(/~{4}(?!~)/g, InstaView.conf.user.name+' ' + newDate).
			replace(/~{3}(?!~)/g, InstaView.conf.user.name).

			// [[:Category:...]], [[:Image:...]], etc...
			replace(RegExp('\\[\\[:((?:'+InstaView.conf.locale.category+'|'+InstaView.conf.locale.image+'|'+InstaView.conf.wiki.interwiki+'):.*?)\\]\\]','gi'), "<a href='"+InstaView.conf.paths.articles+"$1'>$1</a>").
			replace(RegExp('\\[\\[(?:'+InstaView.conf.locale.category+'|'+InstaView.conf.wiki.interwiki+'):.*?\\]\\]','gi'),'').

			// [[/Relative links]]
			replace(/\[\[(\/[^|]*?)\]\]/g, f("<a href='?$1'>$1</a>", InstaView.conf.paths.base_href)).

			// [[/Replaced|Relative links]]
			replace(/\[\[(\/.*?)\|(.+?)\]\]/g, f("<a href='?$1'>$2</a>", InstaView.conf.paths.base_href)).

			// [[Common links]]
			replace(/\[\[([^|]*?)\]\](\w*)/g, f("<a href='?$1'>$1$2</a>", InstaView.conf.paths.articles)).

			// [[Replaced|Links]]
			replace(/\[\[(.*?)\|([^\]]+?)\]\](\w*)/g, f("<a href='?$1'>$2$3</a>", InstaView.conf.paths.articles)).

			// [[Stripped:Namespace|Namespace]]
			replace(/\[\[([^\]]*?:)?(.*?)( *\(.*?\))?\|\]\]/g, f("<a href='?$1$2$3'>$2</a>", InstaView.conf.paths.articles)).

			// External links
			// The separator between the URL and optional label can be either a space character or a pipe symbol
			replace(/\[(https?|news|ftp|mailto|gopher|irc):(\/*)([^\]]*?)[ |](.*?)\]/g, "<a href='$1:$2$3'>$4</a>").

			// MusicBrainz short links
			replace(/\[(series|release-group|release|artist):([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12})\|(.*)\]/g, "<a href='https://musicbrainz.org/$1/$2'>$3</a>").

			// MusicBrainz full links
			replace(/\[(https?:\/\/.*)\|(.*)\]/g, "<a href='$1'>$2</a>").

			replace(/\[http:\/\/(.*?)\]/g, "<a href='http://$1'>[#]</a>").
			replace(/\[(news|ftp|mailto|gopher|irc):(\/*)(.*?)\]/g, "<a href='$1:$2$3'>$1:$2$3</a>").
			replace(/(^| )(https?|news|ftp|mailto|gopher|irc):(\/*)([^ $]*)/g, "$1<a href='$2:$3$4'>$2:$3$4</a>").

			replace('__NOTOC__','').
			replace('__NOEDITSECTION__','');
	}

	function strip_inline_wiki(str) {
		return str
			.replace(/\[\[[^\]]*\|(.*?)\]\]/g,'$1')
			.replace(/\[\[(.*?)\]\]/g,'$1')
			.replace(/''(.*?)''/g,'$1');
	}

	// Begin parsing
	for (; remain();) {
		if ($(/^(={1,6})(.*)\1(.*)$/)) {
			p = 0;
			endl(f('<h?>?</h?>?', $r[1].length, parse_inline_nowiki($r[2]), $r[1].length, $r[3]));
		} else if ($(/^ {4}[*#:;]/)) {
			p = 0;
			parse_list();
		} else if ($(' ')) {
			p = 0;
			parse_pre();
		} else if ($('{|')) {
			p = 0;
			parse_table();
		} else if ($(/^----+$/)) {
			p = 0;
			endl('<hr>');
		} else if ($(InstaView.BLOCK_IMAGE)) {
			p = 0;
			parse_block_image();
		} else {
			// Handle paragraphs
			if ($$('')) {
				p = remain() > 1 && ll[1] === '';

				if (p) {
					endl('<p><br>');
				}
			} else {
				if (!p) {
					ps('<p>');
					p = 1;
				}

				ps(parse_inline_nowiki(ll[0]) + ' ');
			}

			sh();
		}
	}

	return o;
}

/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message Digest Algorithm, as defined in RFC 1321.
 * Version 2.2-alpha Copyright (C) Paul Johnston 1999 - 2005
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
let hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }

/*
 * Calculate the MD5 of a raw string
 */
function rstr_md5(s)
{
	return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
}

/*
 * Convert a raw string to a hex string
 */
function rstr2hex(input)
{
	let hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	let output = "";
	let x;
	for(let i = 0; i < input.length; i++)
	{
		x = input.charCodeAt(i);
		output += hex_tab.charAt((x >>> 4) & 0x0F)
			+  hex_tab.charAt( x        & 0x0F);
	}
	return output;
}

/*
 * Encode a string as utf-8.
 * For efficiency, this assumes the input is valid utf-16.
 */
function str2rstr_utf8(input)
{
	let output = "";
	let i = -1;
	let x, y;

	while(++i < input.length)
	{
		/* Decode utf-16 surrogate pairs */
		x = input.charCodeAt(i);
		y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
		if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
		{
			x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
			i++;
		}

		/* Encode output as utf-8 */
		if(x <= 0x7F)
			output += String.fromCharCode(x);
		else if(x <= 0x7FF)
			output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
				0x80 | ( x         & 0x3F));
		else if(x <= 0xFFFF)
			output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
				0x80 | ((x >>> 6 ) & 0x3F),
				0x80 | ( x         & 0x3F));
		else if(x <= 0x1FFFFF)
			output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
				0x80 | ((x >>> 12) & 0x3F),
				0x80 | ((x >>> 6 ) & 0x3F),
				0x80 | ( x         & 0x3F));
	}
	return output;
}

/*
 * Convert a raw string to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */
function rstr2binl(input)
{
	let output = Array(input.length >> 2);
	for(let i = 0; i < output.length; i++)
		output[i] = 0;
	for(let i = 0; i < input.length * 8; i += 8)
		output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
	return output;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2rstr(input)
{
	let output = "";
	for(let i = 0; i < input.length * 32; i += 8)
		output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
	return output;
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */
function binl_md5(x, len)
{
	/* append padding */
	x[len >> 5] |= 0x80 << ((len) % 32);
	x[(((len + 64) >>> 9) << 4) + 14] = len;

	let a =  1732584193;
	let b = -271733879;
	let c = -1732584194;
	let d =  271733878;

	for(let i = 0; i < x.length; i += 16)
	{
		let olda = a;
		let oldb = b;
		let oldc = c;
		let oldd = d;

		a = md5_ff(a, b, c, d, x[i], 7 , -680876936);
		d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
		c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
		b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
		a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
		d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
		c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
		b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
		a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
		d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
		c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
		b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
		a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
		d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
		c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
		b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

		a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
		d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
		c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
		b = md5_gg(b, c, d, a, x[i], 20, -373897302);
		a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
		d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
		c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
		b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
		a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
		d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
		c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
		b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
		a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
		d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
		c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
		b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

		a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
		d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
		c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
		b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
		a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
		d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
		c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
		b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
		a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
		d = md5_hh(d, a, b, c, x[i], 11, -358537222);
		c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
		b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
		a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
		d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
		c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
		b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

		a = md5_ii(a, b, c, d, x[i], 6 , -198630844);
		d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
		c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
		b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
		a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
		d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
		c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
		b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
		a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
		d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
		c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
		b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
		a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
		d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
		c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
		b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

		a = safe_add(a, olda);
		b = safe_add(b, oldb);
		c = safe_add(c, oldc);
		d = safe_add(d, oldd);
	}
	return Array(a, b, c, d);
}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
	return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
	return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
	return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
	return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
	return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
	let lsw = (x & 0xFFFF) + (y & 0xFFFF);
	let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
	return (num << cnt) | (num >>> (32 - cnt));
}

export default InstaView;

const re_token = /^\s*([+\-*/^()]|(?:[0-9]+(?:\.[0-9]+)?))\s*/;
const re_order = /[A-Z]|\([A-Z]+\)/g;

function tokenise(str) {
    let m;
    let pos = 0;
    const tokens = [];
    while(m=re_token.exec(str.slice(pos))) {
        const token = m[1];
        tokens.push(isNaN(token) ? token : parseFloat(token));
        pos += m[0].length;
    }
    return tokens;
}

function get_matcher(letter) {
    console.log(letter);
    return {
        fn: (tokens,pos) => operations[letter] ? operations[letter](tokens,pos,letter) : null,
        letter: letter
    }
}

function parse_order(def) {
    let m;
    def = def.toUpperCase().trim();
    const order = [];
    re_order.lastIndex = 0;
    while(m = re_order.exec(def)) {
        const s = m[0];
        if(s[0]=='(') {
            const matchers = s.slice(1,s.length-1).split('').map(get_matcher);
            order.push({fn: firstof(matchers), matchers: matchers});
        } else {
            order.push(get_matcher(s));
        }
    }
    return order;
}

function evaluate(tokens) {
    let log = [];
    while(tokens.length>1) {
        const l = tokens.length;
        for(let fn of unary_operations) {
            let res;
            while(res = fn(tokens)) {
                tokens = res.tokens;
            }
        }
        for(let matcher of order) {
            let res;
            let pos = 0;
            while(res = matcher.fn(tokens,pos)) {
                tokens = res.tokens;
                pos = res.pos;
                log = log.concat(res.log);
            }
        }
        break;
    }
    log.push({tokens: tokens.slice()});
    return {tokens, log};
}

function bracket(tokens,pos,letter) {
    tokens = tokens.slice();
    let log = [];
    for(let i=pos;i<tokens.length;i++) {
        const otokens = tokens.slice();
        if(tokens[i]=='(') {
            let depth = 1;
            let j=i+1;
            for(;j<tokens.length;j++) {
                switch(tokens[j]) {
                    case '(':
                        depth += 1;
                        break;
                    case ')':
                        depth -= 1;
                        break;
                }
                if(depth==0) {
                    break;
                }
            }
            const middle = evaluate(tokens.slice(i+1,j));
            tokens.splice(i,j-i+1, ...middle.tokens);
            log.push({op: '(', letter: letter, tokens: otokens, start: i, end: j});
            for(let l of middle.log) {
                const nl = {op: l.op, start: i+l.start+1, end: i+l.end+1, tokens: otokens.slice(0,i+1).concat(l.tokens, otokens.slice(j))};
                //log.push(nl);
            }
            const mtokens = otokens.slice(0,i+1).concat(middle.tokens,otokens.slice(j));
            //log.push({op: '(', tokens: mtokens, start: i, end: i+middle.tokens.length+1});
            log.push({tokens: tokens.slice(), start: i, end: i+middle.tokens.length-1});
            return {tokens, log, pos: i};
        }
    }
}

function binary(op,fn) {
    return function(tokens, pos, letter) {
        tokens = tokens.slice();
        const log = [];
        for(let i=pos+1;i<tokens.length-1;i++) {
            const otokens = tokens.slice();
            if(tokens[i]===op) {
                const left = tokens[i-1];
                const right = tokens[i+1];
                if(!(isNaN(left) || isNaN(right))) {
                    const result = fn(left,right);
                    tokens.splice(i-1,3,result);
                    log.push({op: op, letter: letter, tokens: otokens, start: i-1, end: i+1})
                    log.push({tokens: tokens.slice(), start: i-1, end: i-1});
                    i -= 1;
                    return {tokens, log, pos: i-1};
                }
            }
        }
    }
}

function unary(op,fn) {
    return function(tokens, letter) {
        tokens = tokens.slice();
        const log = [];
        for(let i=0;i<tokens.length-1;i++) {
            const otokens = tokens.slice();
            if(tokens[i]==op && (i==0 || tokens[i-1]=='(')) {
                const result = fn(tokens[i+1]);
                tokens.splice(i,2,result);
                log.push({op: op, letter: letter, tokens: otokens, start: i, end: i+1});
                log.push({tokens: tokens.slice(), start: i, end: i});
                return {tokens, log, pos: i};
            }
        }
    }
}

function firstof(matchers) {
    return function(...args) {
        const [tokens,pos] = args;
        const matches = matchers.map(matcher => matcher.fn(...args)).filter(m=>m);
        console.log(pos, matches);
        return matches.sort((a,b)=>a.pos<b.pos ? -1 : a.pos>b.pos ? 1 : 0)[0];
    }
}

const unary_operations = [
    unary('+', a => a),
    unary('-', a => -a)
];

const operations = {
    'B': bracket,
    'P': bracket,
    'O': binary('^', Math.pow),
    'I': binary('^', Math.pow),
    'E': binary('^', Math.pow),
    'D': binary('/', (a,b) => a/b),
    'M': binary('*', (a,b) => a*b),
    'A': binary('+', (a,b) => a+b),
    'S': binary('-', (a,b) => a-b)
}
const letter_definitions = {
    'A': 'Addition',
    'B': 'Brackets',
    'C': 'Coelecanths',
    'D': 'Division',
    'E': 'Exponents',
    'F': 'Fish',
    'G': 'Gunge',
    'H': 'Horticulture',
    'I': 'Indices',
    'J': 'Jam',
    'K': 'Killer bees',
    'L': 'Leprechauns',
    'M': 'Multiplication',
    'N': 'Nothing',
    'O': 'Ordinals',
    'P': 'Parentheses',
    'Q': 'Quirks',
    'R': 'Rotation',
    'S': 'Subtraction',
    'T': 'Trepidation',
    'U': 'Ungulates',
    'V': 'Volume',
    'W': 'Wishbone',
    'X': 'Xylophone',
    'Y': 'Yoghurt',
    'Z': 'Zebra'
}
let order;

const order_input = document.getElementById('order');
const expression_input = document.getElementById('expression');
const order_output = document.getElementById('order-acrostic');
const result_output = document.getElementById('result');

function update_expression() {
    console.clear();
    order = parse_order(order_input.value);
    const expr = expression_input.value;
    console.log(expr);
    const tokens = tokenise(expr);
    console.log("Initial tokens: ",tokens);
    const result = evaluate(tokens);
    console.log("Result: ", result.tokens);
    console.log("Log: ", result.log);
    console.log(result.log.map(l=>(l.letter || ' ')+' '+l.tokens.join(' ')).join('\n'));

    order_output.innerHTML = display_order();

    result_output.innerHTML = display_log(result.log);
}

function describe_matcher(matcher) {
    if(matcher.letter) {
        const definition = letter_definitions[matcher.letter] || '???';
        return `<strong class="letter">${matcher.letter}</strong> for <span class="definition">${definition}</span>`;
    } else {
        return matcher.matchers.map(describe_matcher).join('<br>or<br>');
    }
}

function display_order() {
    let out = '';
    for(matcher of order) {
        out += '<li>' + describe_matcher(matcher) + '</li>';
    }
    return out;
}

function display_log(log) {
    return log.map(display_log_item).join('\n');
}

function display_log_item(item,row) {
    row += 1;
    let out = '';
    const op = item.letter || '';
    out += `<span class="op ${item.op ? 'present' : ''}" style="grid-row: ${row}; grid-column: 1;">${op}</span>`;
    const tokens = item.tokens.map((t,p)=> {
        const involved = p>=item.start && p<=item.end;
        if(isNaN(t) && !t.length) {
            t = '???';
        }
        if(!isNaN(t) && t%1!=0) {
            t = t.toFixed(3);
        }
        return `<span class="token ${involved ? 'involved' : ''}" style="grid-row: ${row}; grid-column: ${p+2};">${t}</span>`
    });
    out += tokens.join(' ');
    return out;
}

expression_input.addEventListener('input',update_expression) 
order_input.addEventListener('input',update_expression) 

update_expression();

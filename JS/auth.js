
window.Auth = (() => {
    const read = (key, fallback) => {
        try {
            return JSON.parse(localStorage.getItem(key)) ?? fallback;
        } catch {
            return fallback;
        }
    };

    const users = () => read('ipdeokUsers', []);

    const user = () => users().find(
        u => u.id === localStorage.getItem('ipdeokUser')
    ) || null;

    const key = k => k + ':' + (user()?.id || 'guest');

    const root = new URL('../', document.currentScript.src);

    const login = () => {
        sessionStorage.setItem('ipdeokReturn', location.href);
        location.href = new URL('sub/login/login.html', root);
    };

    const save = (k, v) => localStorage.setItem(key(k), v);
    const get = k => localStorage.getItem(key(k));

    return { users, user, key, login, save, get, root };
})();


// 로그인 및 로그아웃

document.addEventListener('DOMContentLoaded', () => {
    const u = Auth.user();

    if (!u) return;

    document.querySelectorAll('.side-menu-list a').forEach(a => {
        if (!a.getAttribute('href')?.endsWith('login.html')) return;

        a.textContent = u.name + '님 · 로그아웃';
        a.href = '#';

        a.onclick = e => {
            e.preventDefault();
            localStorage.removeItem('ipdeokUser');
            location.reload();
        };
    });
});


// 컬렉션 및 스탬프 적립

window.Collection = (() => {

    const map = {
        list1: 'original',
        list2: 'rose',
        list3: 'mala',
        list4: 'jjajang',
        list5: 'cream',
        list6: 'cheese',
        set1: 'original',
        set2: 'rose',
        set3: 'mala',
        set4: 'cheese'
    };

    const names = {
        original: '오리지널',
        rose: '로제',
        mala: '마라',
        jjajang: '짜장',
        cream: '크림',
        cheese: '치즈'
    };

    const read = () => {
        try {
            const d = JSON.parse(Auth.get('collection') || '{}');

            return {
                cards: d.cards || [],
                used: d.used || 0,
                orders: d.orders || {}
            };

        } catch {
            return {
                cards: [],
                used: 0,
                orders: {}
            };
        }
    };

    const save = d => Auth.save(
        'collection',
        JSON.stringify(d)
    );

    const available = () => Math.max(
        0,
        Math.floor(read().cards.length / 5) - read().used
    );

    const result = (d, c) => ({
        card: c,
        count: d.cards.length,
        reward: c.reward === true
    });


    // 스탬프 수령

    function claim(id, kind) {

        if (!Auth.user()) return null;

        const d = read();

        const old = d.cards.find(c => c.id === id);

        if (old) return result(d, old);

        const o = d.orders[id];

        if (!o || !o.choices.includes(kind) || o.claimed) {
            return null;
        }

        const c = {
            id,
            kind,
            name: names[kind],
            date: o.date,
            items: o.items,
            reward: (d.cards.length + 1) % 5 === 0
        };

        o.claimed = true;

        d.cards.push(c);

        save(d);

        return result(d, c);
    }


    // 주문 완료 후 스탬프 지급

    function award(order, useCoupon) {

        if (!Auth.user() || order.memberId !== Auth.user().id) {
            return null;
        }

        const d = read();
        const id = order.number;

        const old = d.cards.find(c => c.id === id);

        if (old) return result(d, old);

        if (d.orders[id]) {
            return d.orders[id].choices.length
                ? { pending: true, id }
                : null;
        }

        if (useCoupon && available() < 1) {
            throw Error('쿠폰 없음');
        }

        const choices = [
            ...new Set(
                order.products
                    .filter(p => p.quantity > 0)
                    .map(p =>
                        map[p.id] ||
                        map[p.image?.replace('.png', '')]
                    )
                    .filter(Boolean)
            )
        ];

        d.orders[id] = {
            choices,
            date: new Date().toISOString(),
            items: order.products.map(
                p => p.name + ' × ' + p.quantity
            ),
            claimed: false
        };

        if (useCoupon) d.used++;

        save(d);

        return choices.length === 1
            ? claim(id, choices[0])
            : choices.length
                ? { pending: true, id }
                : null;
    }


    // 여러 떡볶이 주문 시 스탬프 선택

    function chooser(id, container, onDone) {

        const d = read();
        const o = d.orders[id];

        if (!o || o.claimed || !o.choices.length) return;

        const title = document.createElement('h2');
        title.textContent = '오늘의 최애는 누구?';

        const desc = document.createElement('p');
        desc.textContent =
            '주문한 떡볶이 중 스탬프 1장을 선택해 주세요.';

        const grid = document.createElement('div');

        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin: 12px 0;
        `;

        let selected = null;

        const confirm = document.createElement('button');

        confirm.textContent = '스탬프 받기';
        confirm.disabled = true;

        confirm.style.cssText = `
            background: #EA4028;
            color: white;
            border: 0;
            padding: 14px;
            width: 100%;
            font-weight: bold;
        `;

        for (const kind of o.choices) {

            const b = document.createElement('button');

            b.type = 'button';

            b.style.cssText = `
                background: #FFF8EB;
                border: 3px solid #D8CDBF;
                padding: 8px;
                cursor: pointer;
                border-radius: 12px;
                position: relative;
                color: #392520;
            `;

            const img = document.createElement('img');

            img.src = new URL(
                'sub/collection/img/stamp_' + kind + '.png',
                Auth.root
            );

            img.alt = names[kind];

            img.style.cssText = `
                width: 100%;
                height: 140px;
                object-fit: contain;
                opacity: 0.65;
            `;

            const mark = document.createElement('span');

            mark.textContent = '○ 선택하기';

            mark.style.cssText = `
                display: block;
                font-weight: 700;
                margin-top: 6px;
            `;

            b.append(
                img,
                document.createTextNode(names[kind]),
                mark
            );

            b.setAttribute('aria-pressed', 'false');

            b.onclick = () => {

                selected = kind;

                for (const x of grid.children) {

                    x.style.borderColor =
                        x === b ? '#EA4028' : '#D8CDBF';

                    x.style.background =
                        x === b ? '#FFE1D5' : '#FFF9EF';

                    x.style.boxShadow =
                        x === b ? '0 0 0 2px #EA4028' : 'none';

                    x.querySelector('img').style.opacity =
                        x === b ? '1' : '0.65';

                    x.querySelector('span').textContent =
                        x === b ? '✓ 선택 완료' : '○ 선택하기';

                    x.querySelector('span').style.color =
                        x === b ? '#EA4028' : '#998877';

                    x.setAttribute(
                        'aria-pressed',
                        String(x === b)
                    );
                }

                confirm.disabled = false;
            };

            grid.append(b);
        }

        confirm.onclick = () => {
            const r = claim(id, selected);

            if (r) onDone(r);
        };

        container.replaceChildren(
            title,
            desc,
            grid,
            confirm
        );
    }

    return {
        read,
        available,
        award,
        claim,
        chooser
    };

})();


// 햄버거 메뉴 컬렉션 추가

document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('.side-menu-list').forEach(list => {

        const li = document.createElement('li');
        const a = document.createElement('a');

        a.href = new URL(
            'sub/collection/collection.html',
            Auth.root
        );

        a.textContent = '나의 입덕 컬렉션';

        li.append(a);
        list.append(li);
    });

});


// 상단 로그인 및 MY 버튼

document.addEventListener('DOMContentLoaded', () => {

    const member = Auth.user();
    const header = document.querySelector('.header');
    const menu = document.querySelector('.menu-btn');

    if (
        header &&
        menu &&
        !header.querySelector('.header-account')
    ) {

        const actions = document.createElement('div');
        actions.className = 'header-actions';

        const account = document.createElement('a');
        account.className = 'header-account';

        if (member) {

            account.href = new URL(
                'sub/collection/collection.html',
                Auth.root
            ).href;

            account.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round">

                    <path d="M20 21v-2a7 7 0 0 0-7-7h-2a7 7 0 0 0-7 7v2"/>
                    <circle cx="12" cy="5" r="4"/>

                </svg>

                <span>MY</span>
            `;

            account.setAttribute(
                'aria-label',
                '나의 입덕 컬렉션'
            );

        } else {

            account.href = new URL(
                'sub/login/login.html',
                Auth.root
            ).href;

            account.textContent = '로그인';

            account.addEventListener('click', e => {

                e.preventDefault();

                if (!location.pathname.endsWith('/login.html')) {
                    Auth.login();
                }
            });
        }

        menu.before(actions);
        actions.append(account, menu);
    }


    // 메인 화면 회원 혜택 및 적립 현황

    const home = document.querySelector('.home-main');

    if (!home || home.querySelector('.membership-banner')) {
        return;
    }

    const banner = document.createElement('section');
    banner.className = 'membership-banner';

    const eyebrow = document.createElement('small');
    eyebrow.textContent = 'IPDEOK MEMBERSHIP';

    const title = document.createElement('h2');
    const description = document.createElement('p');
    const link = document.createElement('a');

    link.className = 'membership-link';

    banner.append(eyebrow, title, description);

    if (member) {

        const total = Collection.read().cards.length;
        const progress = total % 5;
        const remaining = 5 - progress;
        const coupons = Collection.available();

        title.textContent =
            member.name + '님, 오늘도 입덕!';

        description.textContent =
            'BIG COUPON까지 ' + remaining + '장 남았어요!';

        const progressBox = document.createElement('div');

        progressBox.className = 'membership-progress';

        for (let i = 0; i < 5; i++) {

            const stamp = document.createElement('span');

            stamp.className =
                i < progress ? 'filled' : '';

            stamp.textContent = '♥';

            progressBox.append(stamp);
        }

        const status = document.createElement('div');

        status.className = 'membership-status';

        status.textContent =
            '적립 ' + progress + '/5 · 보유 쿠폰 ' + coupons + '장';

        banner.append(progressBox, status);

        link.textContent = '나의 입덕 컬렉션 ↗';

        link.href = new URL(
            'sub/collection/collection.html',
            Auth.root
        ).href;

    } else {

        title.textContent = '우리 같이 입덕할래?';

        description.textContent =
            '큐피드 스탬프 5장을 모으면 5,000원 할인!';

        link.textContent = '입덕하러 가기 ↗';

        link.href = new URL(
            'sub/login/login.html',
            Auth.root
        ).href;

        link.addEventListener('click', e => {
            e.preventDefault();
            Auth.login();
        });
    }

    banner.append(link);

    home.prepend(banner);

});

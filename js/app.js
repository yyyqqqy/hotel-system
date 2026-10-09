// ==================== 应用主体 ====================
const App = {
    currentUser: null,
    currentPage: 'dashboard',
    currentSubmenu: 'dashboard',

    // 菜单配置
    menus: [
        { key: 'dashboard', label: '首页', icon: '🏠' },
        {
            key: 'system', label: '系统管理', icon: '⚙️', children: [
                { key: 'employee', label: '员工管理' },
                { key: 'user', label: '用户管理' },
                { key: 'setting', label: '系统参数' },
                { key: 'log', label: '操作日志' }
            ]
        },
        {
            key: 'room', label: '客房管理', icon: '🛏️', children: [
                { key: 'roomType', label: '房型管理' },
                { key: 'room', label: '客房管理' },
                { key: 'roomStatus', label: '客房状态' }
            ]
        },
        {
            key: 'customer', label: '客户管理', icon: '👥', children: [
                { key: 'customer', label: '客户信息' },
                { key: 'member', label: '会员管理' }
            ]
        },
        { key: 'reservation', label: '预订管理', icon: '📋' },
        { key: 'checkin', label: '入住管理', icon: '🔑' },
        {
            key: 'finance', label: '退房结算', icon: '💰', children: [
                { key: 'checkout', label: '退房管理' },
                { key: 'finance', label: '财务统计' }
            ]
        }
    ],

    // 面包屑映射
    breadcrumbMap: {
        dashboard: ['首页'],
        employee: ['系统管理', '员工管理'],
        user: ['系统管理', '用户管理'],
        setting: ['系统管理', '系统参数'],
        log: ['系统管理', '操作日志'],
        roomType: ['客房管理', '房型管理'],
        room: ['客房管理', '客房管理'],
        roomStatus: ['客房管理', '客房状态'],
        customer: ['客户管理', '客户信息'],
        member: ['客户管理', '会员管理'],
        reservation: ['预订管理'],
        checkin: ['入住管理'],
        checkout: ['退房结算', '退房管理'],
        finance: ['退房结算', '财务统计']
    },

    // 初始化
    async init() {
        // 显示加载状态
        document.getElementById('app').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#909399">正在加载数据...</div>';
        // 先从后端或本地加载数据
        await DB.init();
        this.checkAuth();
    },

    // 检查登录状态
    checkAuth() {
        const user = sessionStorage.getItem('hotel_user');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.renderLayout();
            this.navigate('dashboard');
        } else {
            this.renderLogin();
        }
    },

    // 登录
    async login(username, password) {
        try {
            // 优先调用后端 API 登录
            const user = await Api.login(username, password);
            if (user) {
                this.currentUser = user;
                sessionStorage.setItem('hotel_user', JSON.stringify(user));
                this.addLog('登录系统');
                this.renderLayout();
                this.navigate('dashboard');
                Toast.show('登录成功', 'success');
                return true;
            }
        } catch (e) {
            // 后端不可用时，回退到本地验证
            console.warn('后端登录失败，尝试本地验证:', e.message);
            const users = DB.get('users');
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                const { password, ...safeUser } = user;
                this.currentUser = safeUser;
                sessionStorage.setItem('hotel_user', JSON.stringify(safeUser));
                this.addLog('登录系统');
                this.renderLayout();
                this.navigate('dashboard');
                Toast.show('登录成功（本地模式）', 'success');
                return true;
            }
        }
        Toast.show('用户名或密码错误', 'error');
        return false;
    },

    // 退出登录
    logout() {
        sessionStorage.removeItem('hotel_user');
        this.currentUser = null;
        this.renderLogin();
    },

    // 添加操作日志
    addLog(action) {
        DB.add('logs', {
            user: this.currentUser ? this.currentUser.name : '未知',
            action,
            time: now(),
            ip: '192.168.1.100'
        });
    },

    // 渲染登录页
    renderLogin() {
        document.getElementById('app').innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <div class="login-header">
                        <div class="login-logo">丽景大酒店</div>
                        <div class="login-subtitle">酒店管理系统</div>
                    </div>
                    <form id="loginForm">
                        <div class="login-form-group">
                            <label class="login-label">用户名</label>
                            <input class="login-input" id="loginUsername" type="text" placeholder="请输入用户名" value="admin">
                        </div>
                        <div class="login-form-group">
                            <label class="login-label">密码</label>
                            <input class="login-input" id="loginPassword" type="password" placeholder="请输入密码" value="123456">
                        </div>
                        <button type="submit" class="login-btn">登 录</button>
                    </form>
                    <div class="login-tip">默认账号：admin / 123456</div>
                </div>
            </div>
        `;
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const btn = document.querySelector('.login-btn');
            btn.disabled = true;
            btn.textContent = '登录中...';
            await this.login(username, password);
            btn.disabled = false;
            btn.textContent = '登 录';
        });
    },

    // 渲染主布局
    renderLayout() {
        document.getElementById('app').innerHTML = `
            <div class="layout" id="layout">
                <aside class="sidebar" id="sidebar"></aside>
                <div class="sidebar-mask" id="sidebarMask"></div>
                <div class="main">
                    <header class="header">
                        <div class="header-left">
                            <span class="menu-toggle" id="menuToggle">☰</span>
                            <span>丽景大酒店 - 酒店管理系统</span>
                        </div>
                        <div class="header-right">
                            <div class="user-info">
                                <div class="user-avatar">${this.currentUser.name.charAt(0)}</div>
                                <span class="user-name">${this.currentUser.name}</span>
                                <span class="user-role">${this.currentUser.role}</span>
                            </div>
                            <span class="logout-btn" id="logoutBtn">退出登录</span>
                        </div>
                    </header>
                    <main class="content" id="content"></main>
                </div>
            </div>
        `;
        this.renderSidebar();
        const toggleMenu = () => {
            document.querySelector('.sidebar').classList.toggle('mobile-open');
            document.getElementById('sidebarMask').classList.toggle('show');
        };
        document.getElementById('menuToggle').addEventListener('click', toggleMenu);
        document.getElementById('sidebarMask').addEventListener('click', toggleMenu);
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('确定要退出登录吗？')) {
                this.logout();
            }
        });
    },

    // 渲染侧边栏
    renderSidebar() {
        const sidebar = document.getElementById('sidebar');
        let html = `<div class="sidebar-brand">丽景大酒店</div><ul class="sidebar-menu">`;

        this.menus.forEach(menu => {
            const isActive = this.currentSubmenu === menu.key ||
                (menu.children && menu.children.some(c => c.key === this.currentPage));
            const open = isActive ? 'open' : '';

            if (menu.children) {
                html += `
                    <li class="menu-item ${open}">
                        <div class="menu-link ${isActive ? '' : ''}" data-menu="${menu.key}">
                            <span class="menu-icon">${menu.icon}</span>
                            <span>${menu.label}</span>
                            <span class="menu-arrow">▶</span>
                        </div>
                        <ul class="submenu">
                            ${menu.children.map(child => `
                                <li>
                                    <div class="menu-link ${this.currentPage === child.key ? 'active' : ''}" data-page="${child.key}">
                                        ${child.label}
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </li>
                `;
            } else {
                html += `
                    <li class="menu-item">
                        <div class="menu-link ${this.currentPage === menu.key ? 'active' : ''}" data-page="${menu.key}">
                            <span class="menu-icon">${menu.icon}</span>
                            <span>${menu.label}</span>
                        </div>
                    </li>
                `;
            }
        });

        html += `</ul>`;
        sidebar.innerHTML = html;

        // 绑定菜单点击事件
        sidebar.querySelectorAll('[data-menu]').forEach(el => {
            el.addEventListener('click', () => {
                el.parentElement.classList.toggle('open');
            });
        });
        sidebar.querySelectorAll('[data-page]').forEach(el => {
            el.addEventListener('click', () => {
                this.navigate(el.dataset.page);
                // 移动端点击后关闭菜单
                document.querySelector('.sidebar')?.classList.remove('mobile-open');
                document.getElementById('sidebarMask')?.classList.remove('show');
            });
        });
    },

    // 页面导航
    navigate(page) {
        this.currentPage = page;
        // 找到对应的父菜单
        for (const m of this.menus) {
            if (m.key === page) { this.currentSubmenu = page; break; }
            if (m.children && m.children.some(c => c.key === page)) { this.currentSubmenu = m.key; break; }
        }
        this.renderSidebar();
        this.renderContent();
    },

    // 渲染内容区
    renderContent() {
        const content = document.getElementById('content');
        const breadcrumb = this.breadcrumbMap[this.currentPage] || [];
        const bcHtml = breadcrumb.map((b, i) =>
            i === breadcrumb.length - 1 ? `<span class="current">${b}</span>` : `<span>${b}</span>`
        ).join(' <span style="margin:0 6px;color:#c0c4cc">/</span> ');

        content.innerHTML = `<div class="breadcrumb">${bcHtml}</div><div id="pageContainer"></div>`;

        const page = Pages[this.currentPage];
        if (page) {
            page.render(document.getElementById('pageContainer'));
        } else {
            document.getElementById('pageContainer').innerHTML = '<div class="empty">页面开发中...</div>';
        }
    },

    // 刷新当前页面
    refresh() {
        this.renderContent();
    }
};

// ==================== Toast 提示 ====================
const Toast = {
    show(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }
};

// ==================== Modal 弹窗 ====================
const Modal = {
    show({ title, body, footer, width = '520px', onClose }) {
        const mask = document.createElement('div');
        mask.className = 'modal-mask';
        mask.innerHTML = `
            <div class="modal" style="width:${width}">
                <div class="modal-header">
                    <span class="modal-title">${title}</span>
                    <span class="modal-close">×</span>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer"></div>
            </div>
        `;
        document.body.appendChild(mask);
        mask.querySelector('.modal-body').innerHTML = body;
        if (footer) {
            mask.querySelector('.modal-footer').innerHTML = footer;
        } else {
            mask.querySelector('.modal-footer').innerHTML = `
                <button class="btn" id="modalCancel">取消</button>
                <button class="btn btn-primary" id="modalConfirm">确定</button>
            `;
        }
        const close = () => {
            mask.remove();
            if (onClose) onClose();
        };
        mask.querySelector('.modal-close').addEventListener('click', close);
        mask.querySelector('#modalCancel').addEventListener('click', close);
        mask.querySelector('.modal-mask') && mask.addEventListener('click', (e) => {
            if (e.target === mask) close();
        });
        return { mask, close };
    },
    confirm(message, onOk) {
        const { mask, close } = this.show({
            title: '提示',
            body: `<div style="padding:10px 0">${message}</div>`,
            width: '360px'
        });
        mask.querySelector('#modalConfirm').addEventListener('click', () => {
            close();
            onOk();
        });
    }
};

// 启动应用
window.addEventListener('DOMContentLoaded', () => App.init());

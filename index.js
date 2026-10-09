const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
// Vercel serverless 环境下 /tmp 可写，本地开发用项目目录
const DATA_FILE = process.env.VERCEL ? '/tmp/hotel-data.json' : path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 提供前端静态文件（HTML/CSS/JS 与 index.js 在同一目录）
app.use(express.static(__dirname));

// ==================== 数据存储层 ====================
function defaultData() {
    return {
        users: [
            { id: 1, username: 'admin', password: '123456', name: '张管理', role: '系统管理员', phone: '13800138000', status: 1 }
        ],
        employees: [
            { id: 1, name: '张管理', gender: '男', phone: '13800138000', position: '系统管理员', dept: '管理部', entryDate: '2020-01-15', status: 1 },
            { id: 2, name: '李前台', gender: '女', phone: '13800138001', position: '前台接待', dept: '前厅部', entryDate: '2021-03-20', status: 1 },
            { id: 3, name: '王客房', gender: '女', phone: '13800138002', position: '客房主管', dept: '客房部', entryDate: '2020-06-10', status: 1 },
            { id: 4, name: '赵服务', gender: '男', phone: '13800138003', position: '服务员', dept: '客房部', entryDate: '2022-02-15', status: 1 }
        ],
        roomTypes: [
            { id: 1, name: '标准大床房', bedType: '大床', area: 28, price: 288, facilities: 'WiFi,空调,电视,独立卫浴', count: 8 },
            { id: 2, name: '标准双床房', bedType: '双床', area: 30, price: 328, facilities: 'WiFi,空调,电视,独立卫浴', count: 8 },
            { id: 3, name: '豪华大床房', bedType: '大床', area: 40, price: 488, facilities: 'WiFi,空调,电视,浴缸,迷你吧', count: 4 },
            { id: 4, name: '豪华双床房', bedType: '双床', area: 42, price: 528, facilities: 'WiFi,空调,电视,浴缸,迷你吧', count: 4 },
            { id: 5, name: '行政套房', bedType: '大床', area: 65, price: 888, facilities: 'WiFi,空调,电视,浴缸,迷你吧,客厅', count: 2 },
            { id: 6, name: '总统套房', bedType: '大床', area: 120, price: 1888, facilities: 'WiFi,空调,电视,浴缸,迷你吧,客厅,餐厅', count: 1 }
        ],
        rooms: [
            { id: 1, roomNo: '101', typeId: 1, floor: 1, orientation: '朝南', status: '空闲', remark: '' },
            { id: 2, roomNo: '102', typeId: 1, floor: 1, orientation: '朝北', status: '空闲', remark: '' },
            { id: 3, roomNo: '103', typeId: 2, floor: 1, orientation: '朝南', status: '入住', remark: '' },
            { id: 4, roomNo: '104', typeId: 2, floor: 1, orientation: '朝北', status: '清洁中', remark: '' },
            { id: 5, roomNo: '105', typeId: 1, floor: 1, orientation: '朝南', status: '空闲', remark: '' },
            { id: 6, roomNo: '106', typeId: 2, floor: 1, orientation: '朝北', status: '预订', remark: '' },
            { id: 7, roomNo: '201', typeId: 1, floor: 2, orientation: '朝南', status: '入住', remark: '' },
            { id: 8, roomNo: '202', typeId: 1, floor: 2, orientation: '朝北', status: '空闲', remark: '' },
            { id: 9, roomNo: '203', typeId: 2, floor: 2, orientation: '朝南', status: '空闲', remark: '' },
            { id: 10, roomNo: '204', typeId: 2, floor: 2, orientation: '朝北', status: '维修', remark: '空调故障' },
            { id: 11, roomNo: '205', typeId: 3, floor: 2, orientation: '朝南', status: '入住', remark: '' },
            { id: 12, roomNo: '206', typeId: 3, floor: 2, orientation: '朝北', status: '空闲', remark: '' },
            { id: 13, roomNo: '301', typeId: 3, floor: 3, orientation: '朝南', status: '空闲', remark: '' },
            { id: 14, roomNo: '302', typeId: 4, floor: 3, orientation: '朝北', status: '入住', remark: '' },
            { id: 15, roomNo: '303', typeId: 4, floor: 3, orientation: '朝南', status: '空闲', remark: '' },
            { id: 16, roomNo: '304', typeId: 4, floor: 3, orientation: '朝北', status: '清洁中', remark: '' },
            { id: 17, roomNo: '401', typeId: 5, floor: 4, orientation: '朝南', status: '入住', remark: '' },
            { id: 18, roomNo: '402', typeId: 5, floor: 4, orientation: '朝北', status: '空闲', remark: '' },
            { id: 19, roomNo: '501', typeId: 6, floor: 5, orientation: '朝南', status: '空闲', remark: '' },
            { id: 20, roomNo: '502', typeId: 6, floor: 5, orientation: '朝北', status: '预订', remark: '' },
            { id: 21, roomNo: '107', typeId: 1, floor: 1, orientation: '朝东', status: '空闲', remark: '' }
        ],
        customers: [
            { id: 1, name: '陈先生', gender: '男', phone: '13900139001', idCard: '110101199001011234', level: '普通', points: 0, remark: '' },
            { id: 2, name: '刘女士', gender: '女', phone: '13900139002', idCard: '110101199203052345', level: '银卡', points: 1500, remark: '常客' },
            { id: 3, name: '王先生', gender: '男', phone: '13900139003', idCard: '110101198807123456', level: '金卡', points: 5600, remark: '' },
            { id: 4, name: '张女士', gender: '女', phone: '13900139004', idCard: '110101199509084567', level: '普通', points: 200, remark: '' },
            { id: 5, name: '李先生', gender: '男', phone: '13900139005', idCard: '110101198711205678', level: '钻石', points: 18000, remark: 'VIP客户' }
        ],
        members: [
            { id: 1, customerId: 2, cardNo: 'VIP0001', level: '银卡', points: 1500, discount: 0.95, joinDate: '2022-05-10', status: 1 },
            { id: 2, customerId: 3, cardNo: 'VIP0002', level: '金卡', points: 5600, discount: 0.9, joinDate: '2021-08-15', status: 1 },
            { id: 3, customerId: 5, cardNo: 'VIP0003', level: '钻石', points: 18000, discount: 0.85, joinDate: '2020-03-20', status: 1 }
        ],
        reservations: [
            { id: 1, customerId: 2, roomTypeId: 2, roomId: 106, guestName: '刘女士', phone: '13900139002', checkInDate: '2026-10-10', checkOutDate: '2026-10-12', nights: 2, amount: 656, status: '待入住', createTime: '2026-10-08 10:30' },
            { id: 2, customerId: 5, roomTypeId: 6, roomId: 20, guestName: '李先生', phone: '13900139005', checkInDate: '2026-10-11', checkOutDate: '2026-10-14', nights: 3, amount: 5664, status: '待入住', createTime: '2026-10-08 14:20' }
        ],
        checkins: [
            { id: 1, customerId: 1, roomId: 3, guestName: '陈先生', phone: '13900139001', idCard: '110101199001011234', checkInTime: '2026-10-09 09:00', expectedCheckOut: '2026-10-10', deposit: 500, status: '入住中' },
            { id: 2, customerId: 3, roomId: 7, guestName: '王先生', phone: '13900139003', idCard: '110101198807123456', checkInTime: '2026-10-08 15:30', expectedCheckOut: '2026-10-11', deposit: 1000, status: '入住中' },
            { id: 3, customerId: 3, roomId: 11, guestName: '王先生', phone: '13900139003', idCard: '110101198807123456', checkInTime: '2026-10-09 11:00', expectedCheckOut: '2026-10-12', deposit: 1000, status: '入住中' },
            { id: 4, customerId: 1, roomId: 14, guestName: '陈先生', phone: '13900139001', idCard: '110101199001011234', checkInTime: '2026-10-08 14:00', expectedCheckOut: '2026-10-10', deposit: 1000, status: '入住中' },
            { id: 5, customerId: 5, roomId: 17, guestName: '李先生', phone: '13900139005', idCard: '110101198711205678', checkInTime: '2026-10-09 10:00', expectedCheckOut: '2026-10-12', deposit: 2000, status: '入住中' }
        ],
        checkouts: [
            { id: 1, customerId: 2, roomId: 5, guestName: '刘女士', checkInTime: '2026-10-05 14:00', checkOutTime: '2026-10-08 11:30', nights: 3, roomFee: 864, otherFee: 0, total: 864, paymentMethod: '微信' },
            { id: 2, customerId: 4, roomId: 8, guestName: '张女士', checkInTime: '2026-10-06 15:00', checkOutTime: '2026-10-07 10:30', nights: 1, roomFee: 328, otherFee: 50, total: 378, paymentMethod: '支付宝' },
            { id: 3, customerId: 1, roomId: 9, guestName: '陈先生', checkInTime: '2026-10-04 13:00', checkOutTime: '2026-10-06 12:00', nights: 2, roomFee: 656, otherFee: 0, total: 656, paymentMethod: '现金' }
        ],
        settings: [
            { id: 1, key: 'hotel_name', value: '丽景大酒店', label: '酒店名称' },
            { id: 2, key: 'deposit_rate', value: '100', label: '押金比例(%)' },
            { id: 3, key: 'check_out_time', value: '12:00', label: '退房时间' },
            { id: 4, key: 'check_in_time', value: '14:00', label: '入住时间' },
            { id: 5, key: 'member_discount_silver', value: '0.95', label: '银卡折扣' },
            { id: 6, key: 'member_discount_gold', value: '0.9', label: '金卡折扣' },
            { id: 7, key: 'member_discount_diamond', value: '0.85', label: '钻石折扣' }
        ],
        logs: [
            { id: 1, user: '张管理', action: '登录系统', time: '2026-10-09 08:30:00', ip: '192.168.1.100' },
            { id: 2, user: '张管理', action: '新增客房 107', time: '2026-10-09 09:15:23', ip: '192.168.1.100' },
            { id: 3, user: '李前台', action: '办理入住 103', time: '2026-10-09 09:00:00', ip: '192.168.1.101' },
            { id: 4, user: '李前台', action: '办理退房 5', time: '2026-10-08 11:30:00', ip: '192.168.1.101' },
            { id: 5, user: '张管理', action: '新增房型 行政套房', time: '2026-10-07 16:20:00', ip: '192.168.1.100' }
        ]
    };
}

// 内存数据（启动时从文件加载，无文件则用默认数据）
let db = {};
try {
    if (fs.existsSync(DATA_FILE)) {
        db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } else {
        db = defaultData();
        saveData();
    }
} catch (e) {
    console.error('数据加载失败，使用默认数据', e);
    db = defaultData();
    saveData();
}

function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// 统一响应
function send(res, data, code = 0, msg = 'success') {
    res.json({ code, msg, data });
}

// ==================== 认证接口 ====================
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.users.find(u => u.username === username && u.password === password);
    if (user) {
        const { password, ...safeUser } = user;
        send(res, safeUser);
    } else {
        send(res, null, 1, '用户名或密码错误');
    }
});

// ==================== 通用 CRUD 路由工厂 ====================
const collections = ['users', 'employees', 'roomTypes', 'rooms', 'customers', 'members', 'reservations', 'checkins', 'checkouts', 'settings', 'logs'];

collections.forEach(col => {
    // 获取列表
    app.get(`/api/${col}`, (req, res) => {
        send(res, db[col] || []);
    });

    // 获取单条
    app.get(`/api/${col}/:id`, (req, res) => {
        const id = parseInt(req.params.id);
        const item = (db[col] || []).find(i => i.id === id);
        if (item) send(res, item);
        else send(res, null, 1, '数据不存在');
    });

    // 新增
    app.post(`/api/${col}`, (req, res) => {
        const list = db[col] || [];
        const maxId = list.reduce((m, i) => Math.max(m, i.id || 0), 0);
        const item = { id: maxId + 1, ...req.body };
        list.push(item);
        saveData();
        send(res, item);
    });

    // 更新
    app.put(`/api/${col}/:id`, (req, res) => {
        const id = parseInt(req.params.id);
        const list = db[col] || [];
        const idx = list.findIndex(i => i.id === id);
        if (idx > -1) {
            list[idx] = { ...list[idx], ...req.body, id };
            saveData();
            send(res, list[idx]);
        } else {
            send(res, null, 1, '数据不存在');
        }
    });

    // 删除
    app.delete(`/api/${col}/:id`, (req, res) => {
        const id = parseInt(req.params.id);
        db[col] = (db[col] || []).filter(i => i.id !== id);
        saveData();
        send(res, { id });
    });
});

// ==================== 批量操作 ====================
// 批量更新（用于事务性操作，如入住时同时更新房间状态）
app.post('/api/batch', (req, res) => {
    const { operations } = req.body; // [{collection, id, data}]
    operations.forEach(op => {
        const list = db[op.collection] || [];
        if (op.id) {
            const idx = list.findIndex(i => i.id === op.id);
            if (idx > -1) {
                list[idx] = { ...list[idx], ...op.data };
            }
        } else {
            const maxId = list.reduce((m, i) => Math.max(m, i.id || 0), 0);
            list.push({ id: maxId + 1, ...op.data });
        }
    });
    saveData();
    send(res, { success: true });
});

// 重置数据
app.post('/api/reset', (req, res) => {
    db = defaultData();
    saveData();
    send(res, { success: true });
});

// Vercel serverless 环境导出 app，本地环境启动服务
if (process.env.VERCEL) {
    module.exports = app;
} else {
    app.listen(PORT, () => {
        console.log(`酒店管理系统后端服务已启动: http://localhost:${PORT}`);
    });
}

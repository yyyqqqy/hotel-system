// ==================== 页面模块 ====================
const Pages = {};

// ==================== 仪表盘首页 ====================
Pages.dashboard = {
    render(container) {
        const rooms = DB.get('rooms');
        const checkins = DB.get('checkins').filter(c => c.status === '入住中');
        const reservations = DB.get('reservations').filter(r => r.status === '待入住');
        const checkouts = DB.get('checkouts');
        const todayIncome = checkouts
            .filter(c => c.checkOutTime.startsWith(formatDate(new Date())))
            .reduce((s, c) => s + c.total, 0);

        const statusCount = {};
        rooms.forEach(r => { statusCount[r.status] = (statusCount[r.status] || 0) + 1; });

        // 近7天入住趋势（模拟）
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({
                label: `${d.getMonth() + 1}/${d.getDate()}`,
                value: Math.floor(Math.random() * 8) + 2
            });
        }

        container.innerHTML = `
            <div class="stat-cards">
                <div class="stat-card">
                    <div class="stat-icon blue">🛏️</div>
                    <div class="stat-info">
                        <div class="stat-value">${rooms.length}</div>
                        <div class="stat-label">总客房数</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red">👤</div>
                    <div class="stat-info">
                        <div class="stat-value">${checkins.length}</div>
                        <div class="stat-label">当前入住</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">📋</div>
                    <div class="stat-info">
                        <div class="stat-value">${reservations.length}</div>
                        <div class="stat-label">待入住预订</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">💰</div>
                    <div class="stat-info">
                        <div class="stat-value">¥${todayIncome.toFixed(0)}</div>
                        <div class="stat-label">今日营业额</div>
                    </div>
                </div>
            </div>
            <div class="dashboard-row">
                <div class="card">
                    <div class="card-header"><span class="card-title">房间状态分布</span></div>
                    <div class="card-body">
                        <div class="bar-chart">
                            ${Object.entries(statusCount).map(([status, count]) => `
                                <div class="bar-item">
                                    <div class="bar-value">${count}</div>
                                    <div class="bar" style="height:${count * 20 + 20}px"></div>
                                    <div class="bar-label">${status}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title">近7天入住趋势</span></div>
                    <div class="card-body">
                        <div class="bar-chart">
                            ${days.map(d => `
                                <div class="bar-item">
                                    <div class="bar-value">${d.value}</div>
                                    <div class="bar" style="height:${d.value * 15 + 10}px"></div>
                                    <div class="bar-label">${d.label}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">最新入住记录</span></div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>房间号</th>
                            <th>客人姓名</th>
                            <th>联系电话</th>
                            <th>入住时间</th>
                            <th>预计退房</th>
                            <th>状态</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${checkins.slice(0, 5).map(c => {
                            const room = rooms.find(r => r.id === c.roomId);
                            return `<tr>
                                <td>${room ? room.roomNo : '-'}</td>
                                <td>${c.guestName}</td>
                                <td>${c.phone}</td>
                                <td>${c.checkInTime}</td>
                                <td>${c.expectedCheckOut}</td>
                                <td><span class="tag tag-primary">${c.status}</span></td>
                            </tr>`;
                        }).join('')}
                        ${checkins.length === 0 ? '<tr><td colspan="6" class="empty">暂无数据</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
    }
};

// ==================== 客房管理 ====================
Pages.room = {
    filter: { keyword: '', typeId: '', floor: '', status: '' },

    render(container) {
        const roomTypes = DB.get('roomTypes');
        const rooms = DB.get('rooms');
        const floors = [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b);

        let filtered = rooms.filter(r => {
            if (this.filter.keyword) {
                const rt = roomTypes.find(t => t.id === r.typeId);
                const kw = this.filter.keyword.toLowerCase();
                if (!r.roomNo.toLowerCase().includes(kw) && !(rt && rt.name.toLowerCase().includes(kw))) return false;
            }
            if (this.filter.typeId && r.typeId != this.filter.typeId) return false;
            if (this.filter.floor && r.floor != this.filter.floor) return false;
            if (this.filter.status && r.status !== this.filter.status) return false;
            return true;
        });

        container.innerHTML = `
            <div class="filter-bar">
                <div class="filter-item">
                    <input class="filter-input" id="fKeyword" placeholder="搜索房间号/房型" value="${this.filter.keyword}">
                </div>
                <div class="filter-item">
                    <select class="filter-select" id="fTypeId">
                        <option value="">全部房型</option>
                        ${roomTypes.map(t => `<option value="${t.id}" ${this.filter.typeId == t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-item">
                    <select class="filter-select" id="fFloor">
                        <option value="">全部楼层</option>
                        ${floors.map(f => `<option value="${f}" ${this.filter.floor == f ? 'selected' : ''}>${f}楼</option>`).join('')}
                    </select>
                </div>
                <div class="filter-item">
                    <select class="filter-select" id="fStatus">
                        <option value="">全部状态</option>
                        <option value="空闲" ${this.filter.status === '空闲' ? 'selected' : ''}>空闲</option>
                        <option value="入住" ${this.filter.status === '入住' ? 'selected' : ''}>入住</option>
                        <option value="预订" ${this.filter.status === '预订' ? 'selected' : ''}>预订</option>
                        <option value="清洁中" ${this.filter.status === '清洁中' ? 'selected' : ''}>清洁中</option>
                        <option value="维修" ${this.filter.status === '维修' ? 'selected' : ''}>维修</option>
                    </select>
                </div>
                <div class="filter-actions">
                    <button class="btn btn-primary" id="searchBtn">查询</button>
                    <button class="btn btn-primary" id="addBtn">+ 新增客房</button>
                </div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>房间号</th>
                            <th>房型</th>
                            <th>楼层</th>
                            <th>朝向</th>
                            <th>状态</th>
                            <th>备注</th>
                            <th width="140">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(r => {
                            const rt = roomTypes.find(t => t.id === r.typeId);
                            return `<tr>
                                <td>${r.roomNo}</td>
                                <td>${rt ? rt.name : '-'}</td>
                                <td>${r.floor}楼</td>
                                <td>${r.orientation}</td>
                                <td><span class="tag ${ROOM_STATUS_TAG[r.status]}">${r.status}</span></td>
                                <td>${r.remark || '-'}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn btn-text" data-edit="${r.id}">编辑</button>
                                        <button class="btn btn-text" style="color:#f56c6c" data-del="${r.id}">删除</button>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                        ${filtered.length === 0 ? '<tr><td colspan="7" class="empty">暂无数据</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('searchBtn').onclick = () => {
            this.filter.keyword = document.getElementById('fKeyword').value;
            this.filter.typeId = document.getElementById('fTypeId').value;
            this.filter.floor = document.getElementById('fFloor').value;
            this.filter.status = document.getElementById('fStatus').value;
            App.refresh();
        };
        document.getElementById('addBtn').onclick = () => this.showForm();
        container.querySelectorAll('[data-edit]').forEach(el => {
            el.onclick = () => this.showForm(parseInt(el.dataset.edit));
        });
        container.querySelectorAll('[data-del]').forEach(el => {
            el.onclick = () => {
                Modal.confirm('确定要删除该客房吗？', () => {
                    DB.remove('rooms', parseInt(el.dataset.del));
                    App.addLog('删除客房');
                    Toast.show('删除成功', 'success');
                    App.refresh();
                });
            };
        });
    },

    showForm(id) {
        const roomTypes = DB.get('roomTypes');
        const rooms = DB.get('rooms');
        const room = id ? rooms.find(r => r.id === id) : null;
        const isEdit = !!room;

        const { mask, close } = Modal.show({
            title: isEdit ? '编辑客房' : '新增客房',
            width: '520px',
            body: `
                <form id="roomForm">
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>房间号</label>
                            <input class="form-input" name="roomNo" value="${room ? room.roomNo : ''}" placeholder="如 101">
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>楼层</label>
                            <input class="form-input" name="floor" type="number" value="${room ? room.floor : 1}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>房型</label>
                            <select class="form-select" name="typeId">
                                ${roomTypes.map(t => `<option value="${t.id}" ${room && room.typeId === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>朝向</label>
                            <select class="form-select" name="orientation">
                                <option value="朝南" ${room && room.orientation === '朝南' ? 'selected' : ''}>朝南</option>
                                <option value="朝北" ${room && room.orientation === '朝北' ? 'selected' : ''}>朝北</option>
                                <option value="朝东" ${room && room.orientation === '朝东' ? 'selected' : ''}>朝东</option>
                                <option value="朝西" ${room && room.orientation === '朝西' ? 'selected' : ''}>朝西</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>状态</label>
                            <select class="form-select" name="status">
                                <option value="空闲" ${!room || room.status === '空闲' ? 'selected' : ''}>空闲</option>
                                <option value="入住" ${room && room.status === '入住' ? 'selected' : ''}>入住</option>
                                <option value="预订" ${room && room.status === '预订' ? 'selected' : ''}>预订</option>
                                <option value="清洁中" ${room && room.status === '清洁中' ? 'selected' : ''}>清洁中</option>
                                <option value="维修" ${room && room.status === '维修' ? 'selected' : ''}>维修</option>
                            </select>
                        </div>
                        <div class="form-item">
                            <label class="form-label">备注</label>
                            <input class="form-input" name="remark" value="${room ? room.remark || '' : ''}">
                        </div>
                    </div>
                </form>
            `
        });

        mask.querySelector('#modalConfirm').onclick = () => {
            const form = mask.querySelector('#roomForm');
            const data = {
                roomNo: form.roomNo.value.trim(),
                floor: parseInt(form.floor.value),
                typeId: parseInt(form.typeId.value),
                orientation: form.orientation.value,
                status: form.status.value,
                remark: form.remark.value.trim()
            };
            if (!data.roomNo) { Toast.show('请输入房间号', 'error'); return; }
            if (isEdit) {
                DB.update('rooms', id, data);
                App.addLog(`编辑客房 ${data.roomNo}`);
            } else {
                DB.add('rooms', data);
                App.addLog(`新增客房 ${data.roomNo}`);
            }
            close();
            Toast.show(isEdit ? '编辑成功' : '新增成功', 'success');
            App.refresh();
        };
    }
};

// ==================== 房型管理 ====================
Pages.roomType = {
    render(container) {
        const list = DB.get('roomTypes');
        container.innerHTML = `
            <div class="filter-bar">
                <div class="filter-actions" style="margin-left:auto">
                    <button class="btn btn-primary" id="addBtn">+ 新增房型</button>
                </div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>房型名称</th>
                            <th>床型</th>
                            <th>面积(㎡)</th>
                            <th>价格(元/晚)</th>
                            <th>房间数量</th>
                            <th>配套设施</th>
                            <th width="140">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(t => `<tr>
                            <td>${t.name}</td>
                            <td>${t.bedType}</td>
                            <td>${t.area}</td>
                            <td style="color:#f56c6c;font-weight:500">¥${t.price}</td>
                            <td>${t.count}</td>
                            <td>${t.facilities}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn btn-text" data-edit="${t.id}">编辑</button>
                                    <button class="btn btn-text" style="color:#f56c6c" data-del="${t.id}">删除</button>
                                </div>
                            </td>
                        </tr>`).join('')}
                        ${list.length === 0 ? '<tr><td colspan="7" class="empty">暂无数据</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('addBtn').onclick = () => this.showForm();
        container.querySelectorAll('[data-edit]').forEach(el => {
            el.onclick = () => this.showForm(parseInt(el.dataset.edit));
        });
        container.querySelectorAll('[data-del]').forEach(el => {
            el.onclick = () => {
                Modal.confirm('确定要删除该房型吗？', () => {
                    DB.remove('roomTypes', parseInt(el.dataset.del));
                    App.addLog('删除房型');
                    Toast.show('删除成功', 'success');
                    App.refresh();
                });
            };
        });
    },

    showForm(id) {
        const t = id ? DB.get('roomTypes').find(x => x.id === id) : null;
        const { mask, close } = Modal.show({
            title: t ? '编辑房型' : '新增房型',
            body: `
                <form id="rtForm">
                    <div class="form-item">
                        <label class="form-label"><span class="required">*</span>房型名称</label>
                        <input class="form-input" name="name" value="${t ? t.name : ''}" placeholder="如 标准大床房">
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>床型</label>
                            <select class="form-select" name="bedType">
                                <option value="大床" ${t && t.bedType === '大床' ? 'selected' : ''}>大床</option>
                                <option value="双床" ${t && t.bedType === '双床' ? 'selected' : ''}>双床</option>
                                <option value="圆床" ${t && t.bedType === '圆床' ? 'selected' : ''}>圆床</option>
                            </select>
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>面积(㎡)</label>
                            <input class="form-input" name="area" type="number" value="${t ? t.area : 30}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>价格(元/晚)</label>
                            <input class="form-input" name="price" type="number" value="${t ? t.price : 288}">
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>房间数量</label>
                            <input class="form-input" name="count" type="number" value="${t ? t.count : 1}">
                        </div>
                    </div>
                    <div class="form-item">
                        <label class="form-label">配套设施</label>
                        <input class="form-input" name="facilities" value="${t ? t.facilities : ''}" placeholder="如 WiFi,空调,电视">
                    </div>
                </form>
            `
        });
        mask.querySelector('#modalConfirm').onclick = () => {
            const form = mask.querySelector('#rtForm');
            const data = {
                name: form.name.value.trim(),
                bedType: form.bedType.value,
                area: parseInt(form.area.value),
                price: parseFloat(form.price.value),
                count: parseInt(form.count.value),
                facilities: form.facilities.value.trim()
            };
            if (!data.name) { Toast.show('请输入房型名称', 'error'); return; }
            if (t) { DB.update('roomTypes', id, data); App.addLog(`编辑房型 ${data.name}`); }
            else { DB.add('roomTypes', data); App.addLog(`新增房型 ${data.name}`); }
            close();
            Toast.show('保存成功', 'success');
            App.refresh();
        };
    }
};

// ==================== 客房状态 ====================
Pages.roomStatus = {
    render(container) {
        const rooms = DB.get('rooms');
        const roomTypes = DB.get('roomTypes');
        const statuses = ['空闲', '入住', '预订', '清洁中', '维修'];
        const colors = { '空闲': '#67c23a', '入住': '#f56c6c', '预订': '#e6a23c', '清洁中': '#1890ff', '维修': '#909399' };

        container.innerHTML = `
            <div class="room-status-legend">
                ${statuses.map(s => `<div class="legend-item"><div class="legend-dot" style="background:${colors[s]}"></div>${s} <span style="color:#909399">(${rooms.filter(r => r.status === s).length})</span></div>`).join('')}
            </div>
            <div class="room-grid">
                ${rooms.map(r => {
                    const rt = roomTypes.find(t => t.id === r.typeId);
                    return `<div class="room-card ${ROOM_STATUS_CLASS[r.status]}" data-room="${r.id}">
                        <div class="room-card-header">
                            <span class="room-no">${r.roomNo}</span>
                            <span class="tag ${ROOM_STATUS_TAG[r.status]}">${r.status}</span>
                        </div>
                        <div class="room-type-name">${rt ? rt.name : '-'}</div>
                        <div class="room-card-footer">
                            <span>${r.floor}楼 · ${r.orientation}</span>
                            <span style="color:#f56c6c">¥${rt ? rt.price : '-'}</span>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        `;

        container.querySelectorAll('[data-room]').forEach(el => {
            el.onclick = () => {
                const r = rooms.find(x => x.id === parseInt(el.dataset.room));
                const rt = roomTypes.find(t => t.id === r.typeId);
                const checkin = DB.get('checkins').find(c => c.roomId === r.id && c.status === '入住中');
                const reservation = DB.get('reservations').find(res => res.roomId === r.id && res.status === '待入住');
                Modal.show({
                    title: `客房 ${r.roomNo} 详情`,
                    width: '480px',
                    body: `
                        <div class="checkin-summary">
                            <div class="summary-item"><span class="summary-label">房间号</span><span class="summary-value">${r.roomNo}</span></div>
                            <div class="summary-item"><span class="summary-label">房型</span><span class="summary-value">${rt ? rt.name : '-'}</span></div>
                            <div class="summary-item"><span class="summary-label">楼层/朝向</span><span class="summary-value">${r.floor}楼 / ${r.orientation}</span></div>
                            <div class="summary-item"><span class="summary-label">价格</span><span class="summary-value">¥${rt ? rt.price : '-'}/晚</span></div>
                            <div class="summary-item"><span class="summary-label">状态</span><span class="summary-value">${r.status}</span></div>
                            ${checkin ? `<div class="summary-item"><span class="summary-label">入住客人</span><span class="summary-value">${checkin.guestName} (${checkin.phone})</span></div>
                            <div class="summary-item"><span class="summary-label">入住时间</span><span class="summary-value">${checkin.checkInTime}</span></div>` : ''}
                            ${reservation ? `<div class="summary-item"><span class="summary-label">预订客人</span><span class="summary-value">${reservation.guestName} (${reservation.phone})</span></div>
                            <div class="summary-item"><span class="summary-label">预订日期</span><span class="summary-value">${reservation.checkInDate} ~ ${reservation.checkOutDate}</span></div>` : ''}
                            ${r.remark ? `<div class="summary-item"><span class="summary-label">备注</span><span class="summary-value">${r.remark}</span></div>` : ''}
                        </div>
                    `,
                    footer: `<button class="btn" id="modalCancel">关闭</button>`
                });
            };
        });
    }
};

// ==================== 客户信息 ====================
Pages.customer = {
    filter: { keyword: '' },
    render(container) {
        let list = DB.get('customers');
        if (this.filter.keyword) {
            const kw = this.filter.keyword.toLowerCase();
            list = list.filter(c => c.name.toLowerCase().includes(kw) || c.phone.includes(kw));
        }
        container.innerHTML = `
            <div class="filter-bar">
                <div class="filter-item">
                    <input class="filter-input" id="fKeyword" placeholder="搜索姓名/手机号" value="${this.filter.keyword}">
                </div>
                <div class="filter-actions">
                    <button class="btn btn-primary" id="searchBtn">查询</button>
                    <button class="btn btn-primary" id="addBtn">+ 新增客户</button>
                </div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>姓名</th>
                            <th>性别</th>
                            <th>手机号</th>
                            <th>身份证号</th>
                            <th>会员等级</th>
                            <th>积分</th>
                            <th>备注</th>
                            <th width="140">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(c => `<tr>
                            <td>${c.name}</td>
                            <td>${c.gender}</td>
                            <td>${c.phone}</td>
                            <td>${c.idCard}</td>
                            <td><span class="tag ${c.level === '钻石' ? 'tag-warning' : c.level === '金卡' ? 'tag-primary' : c.level === '银卡' ? 'tag-success' : 'tag-info'}">${c.level}</span></td>
                            <td>${c.points}</td>
                            <td>${c.remark || '-'}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn btn-text" data-edit="${c.id}">编辑</button>
                                    <button class="btn btn-text" style="color:#f56c6c" data-del="${c.id}">删除</button>
                                </div>
                            </td>
                        </tr>`).join('')}
                        ${list.length === 0 ? '<tr><td colspan="8" class="empty">暂无数据</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('searchBtn').onclick = () => {
            this.filter.keyword = document.getElementById('fKeyword').value;
            App.refresh();
        };
        document.getElementById('addBtn').onclick = () => this.showForm();
        container.querySelectorAll('[data-edit]').forEach(el => {
            el.onclick = () => this.showForm(parseInt(el.dataset.edit));
        });
        container.querySelectorAll('[data-del]').forEach(el => {
            el.onclick = () => {
                Modal.confirm('确定要删除该客户吗？', () => {
                    DB.remove('customers', parseInt(el.dataset.del));
                    Toast.show('删除成功', 'success');
                    App.refresh();
                });
            };
        });
    },
    showForm(id) {
        const c = id ? DB.get('customers').find(x => x.id === id) : null;
        const { mask, close } = Modal.show({
            title: c ? '编辑客户' : '新增客户',
            body: `
                <form id="custForm">
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>姓名</label>
                            <input class="form-input" name="name" value="${c ? c.name : ''}">
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>性别</label>
                            <select class="form-select" name="gender">
                                <option value="男" ${c && c.gender === '男' ? 'selected' : ''}>男</option>
                                <option value="女" ${c && c.gender === '女' ? 'selected' : ''}>女</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>手机号</label>
                            <input class="form-input" name="phone" value="${c ? c.phone : ''}">
                        </div>
                        <div class="form-item">
                            <label class="form-label">身份证号</label>
                            <input class="form-input" name="idCard" value="${c ? c.idCard : ''}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label">会员等级</label>
                            <select class="form-select" name="level">
                                ${MEMBER_LEVELS.map(l => `<option value="${l}" ${c && c.level === l ? 'selected' : ''}>${l}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-item">
                            <label class="form-label">积分</label>
                            <input class="form-input" name="points" type="number" value="${c ? c.points : 0}">
                        </div>
                    </div>
                    <div class="form-item">
                        <label class="form-label">备注</label>
                        <textarea class="form-textarea" name="remark">${c ? c.remark || '' : ''}</textarea>
                    </div>
                </form>
            `
        });
        mask.querySelector('#modalConfirm').onclick = () => {
            const form = mask.querySelector('#custForm');
            const data = {
                name: form.name.value.trim(),
                gender: form.gender.value,
                phone: form.phone.value.trim(),
                idCard: form.idCard.value.trim(),
                level: form.level.value,
                points: parseInt(form.points.value) || 0,
                remark: form.remark.value.trim()
            };
            if (!data.name) { Toast.show('请输入姓名', 'error'); return; }
            if (!data.phone) { Toast.show('请输入手机号', 'error'); return; }
            if (c) { DB.update('customers', id, data); }
            else { DB.add('customers', data); }
            App.addLog(`${c ? '编辑' : '新增'}客户 ${data.name}`);
            close();
            Toast.show('保存成功', 'success');
            App.refresh();
        };
    }
};

// ==================== 会员管理 ====================
Pages.member = {
    render(container) {
        const members = DB.get('members');
        const customers = DB.get('customers');
        container.innerHTML = `
            <div class="filter-bar">
                <div class="filter-actions" style="margin-left:auto">
                    <button class="btn btn-primary" id="addBtn">+ 新增会员</button>
                </div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>会员卡号</th>
                            <th>客户姓名</th>
                            <th>联系电话</th>
                            <th>会员等级</th>
                            <th>积分</th>
                            <th>折扣</th>
                            <th>入会日期</th>
                            <th>状态</th>
                            <th width="100">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${members.map(m => {
                            const c = customers.find(x => x.id === m.customerId);
                            return `<tr>
                                <td>${m.cardNo}</td>
                                <td>${c ? c.name : '-'}</td>
                                <td>${c ? c.phone : '-'}</td>
                                <td><span class="tag ${m.level === '钻石' ? 'tag-warning' : m.level === '金卡' ? 'tag-primary' : 'tag-success'}">${m.level}</span></td>
                                <td>${m.points}</td>
                                <td>${(m.discount * 10).toFixed(1)}折</td>
                                <td>${m.joinDate}</td>
                                <td><span class="tag ${m.status ? 'tag-success' : 'tag-info'}">${m.status ? '正常' : '停用'}</span></td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn btn-text" data-edit="${m.id}">编辑</button>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                        ${members.length === 0 ? '<tr><td colspan="9" class="empty">暂无数据</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('addBtn').onclick = () => this.showForm();
        container.querySelectorAll('[data-edit]').forEach(el => {
            el.onclick = () => this.showForm(parseInt(el.dataset.edit));
        });
    },
    showForm(id) {
        const m = id ? DB.get('members').find(x => x.id === id) : null;
        const customers = DB.get('customers');
        const { mask, close } = Modal.show({
            title: m ? '编辑会员' : '新增会员',
            body: `
                <form id="memForm">
                    <div class="form-item">
                        <label class="form-label"><span class="required">*</span>选择客户</label>
                        <select class="form-select" name="customerId">
                            <option value="">请选择客户</option>
                            ${customers.map(c => `<option value="${c.id}" ${m && m.customerId === c.id ? 'selected' : ''}>${c.name} (${c.phone})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>会员卡号</label>
                            <input class="form-input" name="cardNo" value="${m ? m.cardNo : 'VIP' + String(Date.now()).slice(-6)}">
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>会员等级</label>
                            <select class="form-select" name="level">
                                <option value="银卡" ${m && m.level === '银卡' ? 'selected' : ''}>银卡</option>
                                <option value="金卡" ${m && m.level === '金卡' ? 'selected' : ''}>金卡</option>
                                <option value="钻石" ${m && m.level === '钻石' ? 'selected' : ''}>钻石</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label">积分</label>
                            <input class="form-input" name="points" type="number" value="${m ? m.points : 0}">
                        </div>
                        <div class="form-item">
                            <label class="form-label">状态</label>
                            <select class="form-select" name="status">
                                <option value="1" ${!m || m.status ? 'selected' : ''}>正常</option>
                                <option value="0" ${m && !m.status ? 'selected' : ''}>停用</option>
                            </select>
                        </div>
                    </div>
                </form>
            `
        });
        mask.querySelector('#modalConfirm').onclick = () => {
            const form = mask.querySelector('#memForm');
            const level = form.level.value;
            const data = {
                customerId: parseInt(form.customerId.value),
                cardNo: form.cardNo.value.trim(),
                level,
                points: parseInt(form.points.value) || 0,
                discount: MEMBER_DISCOUNT[level],
                joinDate: m ? m.joinDate : formatDate(new Date()),
                status: parseInt(form.status.value)
            };
            if (!data.customerId) { Toast.show('请选择客户', 'error'); return; }
            if (!data.cardNo) { Toast.show('请输入会员卡号', 'error'); return; }
            if (m) { DB.update('members', id, data); }
            else { DB.add('members', data); }
            App.addLog(`${m ? '编辑' : '新增'}会员 ${data.cardNo}`);
            close();
            Toast.show('保存成功', 'success');
            App.refresh();
        };
    }
};

// ==================== 预订管理 ====================
Pages.reservation = {
    filter: { status: '' },
    render(container) {
        let list = DB.get('reservations');
        if (this.filter.status) list = list.filter(r => r.status === this.filter.status);
        const customers = DB.get('customers');
        const roomTypes = DB.get('roomTypes');
        const rooms = DB.get('rooms');
        container.innerHTML = `
            <div class="filter-bar">
                <div class="filter-item">
                    <label class="filter-label">状态</label>
                    <select class="filter-select" id="fStatus">
                        <option value="">全部</option>
                        <option value="待入住" ${this.filter.status === '待入住' ? 'selected' : ''}>待入住</option>
                        <option value="已入住" ${this.filter.status === '已入住' ? 'selected' : ''}>已入住</option>
                        <option value="已取消" ${this.filter.status === '已取消' ? 'selected' : ''}>已取消</option>
                    </select>
                </div>
                <div class="filter-actions">
                    <button class="btn btn-primary" id="searchBtn">查询</button>
                    <button class="btn btn-primary" id="addBtn">+ 新增预订</button>
                </div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>预订编号</th>
                            <th>客人姓名</th>
                            <th>联系电话</th>
                            <th>房型</th>
                            <th>房间号</th>
                            <th>入住日期</th>
                            <th>退房日期</th>
                            <th>晚数</th>
                            <th>金额</th>
                            <th>状态</th>
                            <th width="180">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(r => {
                            const rt = roomTypes.find(t => t.id === r.roomTypeId);
                            const room = rooms.find(x => x.id === r.roomId);
                            return `<tr>
                                <td>RES${String(r.id).padStart(4, '0')}</td>
                                <td>${r.guestName}</td>
                                <td>${r.phone}</td>
                                <td>${rt ? rt.name : '-'}</td>
                                <td>${room ? room.roomNo : '-'}</td>
                                <td>${r.checkInDate}</td>
                                <td>${r.checkOutDate}</td>
                                <td>${r.nights}</td>
                                <td style="color:#f56c6c">¥${r.amount}</td>
                                <td><span class="tag ${r.status === '待入住' ? 'tag-warning' : r.status === '已入住' ? 'tag-success' : 'tag-info'}">${r.status}</span></td>
                                <td>
                                    <div class="table-actions">
                                        ${r.status === '待入住' ? `<button class="btn btn-text" data-checkin="${r.id}">办理入住</button>` : ''}
                                        ${r.status === '待入住' ? `<button class="btn btn-text" style="color:#f56c6c" data-cancel="${r.id}">取消</button>` : ''}
                                        <button class="btn btn-text" style="color:#f56c6c" data-del="${r.id}">删除</button>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                        ${list.length === 0 ? '<tr><td colspan="11" class="empty">暂无数据</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('searchBtn').onclick = () => {
            this.filter.status = document.getElementById('fStatus').value;
            App.refresh();
        };
        document.getElementById('addBtn').onclick = () => this.showForm();
        container.querySelectorAll('[data-checkin]').forEach(el => {
            el.onclick = () => {
                const r = DB.get('reservations').find(x => x.id === parseInt(el.dataset.checkin));
                Pages.checkin.showForm(null, r);
            };
        });
        container.querySelectorAll('[data-cancel]').forEach(el => {
            el.onclick = () => {
                Modal.confirm('确定要取消该预订吗？', () => {
                    const r = DB.get('reservations').find(x => x.id === parseInt(el.dataset.cancel));
                    DB.batch([
                        { collection: 'reservations', id: r.id, data: { status: '已取消' } },
                        { collection: 'rooms', id: r.roomId, data: { status: '空闲' } }
                    ]);
                    App.addLog('取消预订');
                    Toast.show('已取消预订', 'success');
                    App.refresh();
                });
            };
        });
        container.querySelectorAll('[data-del]').forEach(el => {
            el.onclick = () => {
                Modal.confirm('确定要删除该预订吗？', () => {
                    DB.remove('reservations', parseInt(el.dataset.del));
                    Toast.show('删除成功', 'success');
                    App.refresh();
                });
            };
        });
    },
    showForm() {
        const customers = DB.get('customers');
        const roomTypes = DB.get('roomTypes');
        const freeRooms = DB.get('rooms').filter(r => r.status === '空闲');
        const { mask, close } = Modal.show({
            title: '新增预订',
            width: '560px',
            body: `
                <form id="resForm">
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>客人姓名</label>
                            <input class="form-input" name="guestName">
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>联系电话</label>
                            <input class="form-input" name="phone">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>房型</label>
                            <select class="form-select" name="roomTypeId" id="resRoomType">
                                <option value="">请选择房型</option>
                                ${roomTypes.map(t => `<option value="${t.id}" data-price="${t.price}">${t.name} (¥${t.price})</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>房间号</label>
                            <select class="form-select" name="roomId" id="resRoom">
                                <option value="">请选择房间</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>入住日期</label>
                            <input class="form-input" name="checkInDate" type="date" id="resCheckIn">
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>退房日期</label>
                            <input class="form-input" name="checkOutDate" type="date" id="resCheckOut">
                        </div>
                    </div>
                    <div class="form-item">
                        <label class="form-label">选择已有客户(可选)</label>
                        <select class="form-select" name="customerId">
                            <option value="">新客户</option>
                            ${customers.map(c => `<option value="${c.id}">${c.name} (${c.phone})</option>`).join('')}
                        </select>
                    </div>
                    <div class="checkin-summary">
                        <div class="summary-item"><span class="summary-label">预计金额</span><span class="summary-value highlight" id="resAmount">¥0</span></div>
                    </div>
                </form>
            `
        });
        const updateRooms = () => {
            const typeId = parseInt(mask.querySelector('#resRoomType').value);
            const rooms = freeRooms.filter(r => !typeId || r.typeId === typeId);
            mask.querySelector('#resRoom').innerHTML = '<option value="">请选择房间</option>' +
                rooms.map(r => `<option value="${r.id}">${r.roomNo} (${r.orientation})</option>`).join('');
        };
        mask.querySelector('#resRoomType').onchange = updateRooms;
        const calcAmount = () => {
            const sel = mask.querySelector('#resRoomType option:checked');
            const price = sel ? parseFloat(sel.dataset.price) : 0;
            const inDate = mask.querySelector('#resCheckIn').value;
            const outDate = mask.querySelector('#resCheckOut').value;
            let nights = 0;
            if (inDate && outDate) {
                nights = Math.max(0, Math.ceil((new Date(outDate) - new Date(inDate)) / 86400000));
            }
            mask.querySelector('#resAmount').textContent = `¥${price * nights}`;
            return { price, nights };
        };
        mask.querySelector('#resCheckIn').onchange = calcAmount;
        mask.querySelector('#resCheckOut').onchange = calcAmount;
        mask.querySelector('#modalConfirm').onclick = () => {
            const form = mask.querySelector('#resForm');
            const { price, nights } = calcAmount();
            const data = {
                customerId: parseInt(form.customerId.value) || null,
                roomTypeId: parseInt(form.roomTypeId.value),
                roomId: parseInt(form.roomId.value),
                guestName: form.guestName.value.trim(),
                phone: form.phone.value.trim(),
                checkInDate: form.checkInDate.value,
                checkOutDate: form.checkOutDate.value,
                nights,
                amount: price * nights,
                status: '待入住',
                createTime: now()
            };
            if (!data.guestName || !data.phone || !data.roomTypeId || !data.roomId || !data.checkInDate || !data.checkOutDate) {
                Toast.show('请填写完整信息', 'error'); return;
            }
            if (nights <= 0) { Toast.show('退房日期必须晚于入住日期', 'error'); return; }
            DB.batch([
                { collection: 'reservations', data },
                { collection: 'rooms', id: data.roomId, data: { status: '预订' } }
            ]);
            App.addLog(`新增预订 ${data.guestName}`);
            close();
            Toast.show('预订成功', 'success');
            App.refresh();
        };
    }
};

// ==================== 入住管理 ====================
Pages.checkin = {
    render(container) {
        const list = DB.get('checkins').filter(c => c.status === '入住中');
        const rooms = DB.get('rooms');
        const roomTypes = DB.get('roomTypes');
        container.innerHTML = `
            <div class="filter-bar">
                <div class="filter-actions" style="margin-left:auto">
                    <button class="btn btn-primary" id="addBtn">+ 办理入住</button>
                </div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>入住编号</th>
                            <th>房间号</th>
                            <th>客人姓名</th>
                            <th>联系电话</th>
                            <th>身份证号</th>
                            <th>入住时间</th>
                            <th>预计退房</th>
                            <th>押金</th>
                            <th width="180">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(c => {
                            const room = rooms.find(r => r.id === c.roomId);
                            return `<tr>
                                <td>CK${String(c.id).padStart(4, '0')}</td>
                                <td>${room ? room.roomNo : '-'}</td>
                                <td>${c.guestName}</td>
                                <td>${c.phone}</td>
                                <td>${c.idCard}</td>
                                <td>${c.checkInTime}</td>
                                <td>${c.expectedCheckOut}</td>
                                <td>¥${c.deposit}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn btn-text" data-detail="${c.id}">详情</button>
                                        <button class="btn btn-text" data-checkout="${c.id}">办理退房</button>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                        ${list.length === 0 ? '<tr><td colspan="9" class="empty">暂无入住记录</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('addBtn').onclick = () => this.showForm();
        container.querySelectorAll('[data-detail]').forEach(el => {
            el.onclick = () => {
                const c = DB.get('checkins').find(x => x.id === parseInt(el.dataset.detail));
                const room = rooms.find(r => r.id === c.roomId);
                const rt = roomTypes.find(t => t.id === room.typeId);
                Modal.show({
                    title: '入住详情',
                    width: '480px',
                    body: `
                        <div class="checkin-summary">
                            <div class="summary-item"><span class="summary-label">房间号</span><span class="summary-value">${room ? room.roomNo : '-'}</span></div>
                            <div class="summary-item"><span class="summary-label">房型</span><span class="summary-value">${rt ? rt.name : '-'}</span></div>
                            <div class="summary-item"><span class="summary-label">客人姓名</span><span class="summary-value">${c.guestName}</span></div>
                            <div class="summary-item"><span class="summary-label">联系电话</span><span class="summary-value">${c.phone}</span></div>
                            <div class="summary-item"><span class="summary-label">身份证号</span><span class="summary-value">${c.idCard}</span></div>
                            <div class="summary-item"><span class="summary-label">入住时间</span><span class="summary-value">${c.checkInTime}</span></div>
                            <div class="summary-item"><span class="summary-label">预计退房</span><span class="summary-value">${c.expectedCheckOut}</span></div>
                            <div class="summary-item"><span class="summary-label">押金</span><span class="summary-value">¥${c.deposit}</span></div>
                        </div>
                    `,
                    footer: `<button class="btn" id="modalCancel">关闭</button>`
                });
            };
        });
        container.querySelectorAll('[data-checkout]').forEach(el => {
            el.onclick = () => {
                const c = DB.get('checkins').find(x => x.id === parseInt(el.dataset.checkout));
                Pages.checkout.showForm(c);
            };
        });
    },
    showForm(id, reservation) {
        const customers = DB.get('customers');
        const freeRooms = DB.get('rooms').filter(r => r.status === '空闲' || (reservation && r.id === reservation.roomId));
        const roomTypes = DB.get('roomTypes');
        const { mask, close } = Modal.show({
            title: '办理入住',
            width: '560px',
            body: `
                <form id="ckForm">
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>客人姓名</label>
                            <input class="form-input" name="guestName" value="${reservation ? reservation.guestName : ''}">
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>联系电话</label>
                            <input class="form-input" name="phone" value="${reservation ? reservation.phone : ''}">
                        </div>
                    </div>
                    <div class="form-item">
                        <label class="form-label">身份证号</label>
                        <input class="form-input" name="idCard">
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>房间号</label>
                            <select class="form-select" name="roomId" id="ckRoom">
                                <option value="">请选择房间</option>
                                ${freeRooms.map(r => {
                                    const rt = roomTypes.find(t => t.id === r.typeId);
                                    return `<option value="${r.id}" data-price="${rt ? rt.price : 0}" ${reservation && reservation.roomId === r.id ? 'selected' : ''}>${r.roomNo} - ${rt ? rt.name : ''} (¥${rt ? rt.price : 0})</option>`;
                                }).join('')}
                            </select>
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>预计退房日期</label>
                            <input class="form-input" name="expectedCheckOut" type="date" value="${reservation ? reservation.checkOutDate : ''}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>押金(元)</label>
                            <input class="form-input" name="deposit" type="number" value="500">
                        </div>
                        <div class="form-item">
                            <label class="form-label">选择已有客户</label>
                            <select class="form-select" name="customerId">
                                <option value="">新客户</option>
                                ${customers.map(c => `<option value="${c.id}" ${reservation && reservation.customerId === c.id ? 'selected' : ''}>${c.name} (${c.phone})</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </form>
            `
        });
        mask.querySelector('#modalConfirm').onclick = () => {
            const form = mask.querySelector('#ckForm');
            const roomId = parseInt(form.roomId.value);
            const data = {
                customerId: parseInt(form.customerId.value) || null,
                roomId,
                guestName: form.guestName.value.trim(),
                phone: form.phone.value.trim(),
                idCard: form.idCard.value.trim(),
                checkInTime: now(),
                expectedCheckOut: form.expectedCheckOut.value,
                deposit: parseFloat(form.deposit.value) || 0,
                status: '入住中'
            };
            if (!data.guestName || !data.phone || !roomId || !data.expectedCheckOut) {
                Toast.show('请填写完整信息', 'error'); return;
            }
            const operations = [
                { collection: 'checkins', data },
                { collection: 'rooms', id: roomId, data: { status: '入住' } }
            ];
            if (reservation) {
                operations.push({ collection: 'reservations', id: reservation.id, data: { status: '已入住' } });
            }
            DB.batch(operations);
            App.addLog(`办理入住 房间${roomId}`);
            close();
            Toast.show('入住办理成功', 'success');
            App.refresh();
        };
    }
};

// ==================== 退房管理 ====================
Pages.checkout = {
    render(container) {
        const list = DB.get('checkouts');
        container.innerHTML = `
            <div class="filter-bar">
                <div class="filter-item">
                    <input class="filter-input" id="fKeyword" placeholder="搜索客人姓名/房间号">
                </div>
                <div class="filter-actions">
                    <button class="btn btn-primary" id="searchBtn">查询</button>
                </div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>退房编号</th>
                            <th>客人姓名</th>
                            <th>房间号</th>
                            <th>入住时间</th>
                            <th>退房时间</th>
                            <th>晚数</th>
                            <th>房费</th>
                            <th>其他费用</th>
                            <th>总计</th>
                            <th>支付方式</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(c => `<tr>
                            <td>CO${String(c.id).padStart(4, '0')}</td>
                            <td>${c.guestName}</td>
                            <td>${c.roomId}</td>
                            <td>${c.checkInTime}</td>
                            <td>${c.checkOutTime}</td>
                            <td>${c.nights}</td>
                            <td>¥${c.roomFee}</td>
                            <td>¥${c.otherFee}</td>
                            <td style="color:#f56c6c;font-weight:500">¥${c.total}</td>
                            <td>${c.paymentMethod}</td>
                        </tr>`).join('')}
                        ${list.length === 0 ? '<tr><td colspan="10" class="empty">暂无退房记录</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('searchBtn').onclick = () => {
            const kw = document.getElementById('fKeyword').value.toLowerCase();
            const rows = container.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(kw) ? '' : 'none';
            });
        };
    },
    showForm(checkin) {
        const room = DB.get('rooms').find(r => r.id === checkin.roomId);
        const rt = DB.get('roomTypes').find(t => t.id === room.typeId);
        const checkIn = new Date(checkin.checkInTime);
        const nowDate = new Date();
        const nights = Math.max(1, Math.ceil((nowDate - checkIn) / 86400000));
        const roomFee = rt.price * nights;
        const { mask, close } = Modal.show({
            title: '办理退房',
            width: '560px',
            body: `
                <form id="coForm">
                    <div class="checkin-summary">
                        <div class="summary-item"><span class="summary-label">房间号</span><span class="summary-value">${room.roomNo} (${rt.name})</span></div>
                        <div class="summary-item"><span class="summary-label">客人姓名</span><span class="summary-value">${checkin.guestName}</span></div>
                        <div class="summary-item"><span class="summary-label">入住时间</span><span class="summary-value">${checkin.checkInTime}</span></div>
                        <div class="summary-item"><span class="summary-label">退房时间</span><span class="summary-value">${formatDateTime(nowDate)}</span></div>
                        <div class="summary-item"><span class="summary-label">入住天数</span><span class="summary-value">${nights} 晚</span></div>
                        <div class="summary-item"><span class="summary-label">房费单价</span><span class="summary-value">¥${rt.price} × ${nights} = ¥${roomFee}</span></div>
                        <div class="summary-item"><span class="summary-label">押金</span><span class="summary-value">¥${checkin.deposit}</span></div>
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label">其他费用(元)</label>
                            <input class="form-input" name="otherFee" type="number" value="0" id="coOther">
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>支付方式</label>
                            <select class="form-select" name="paymentMethod">
                                <option value="现金">现金</option>
                                <option value="微信">微信</option>
                                <option value="支付宝">支付宝</option>
                                <option value="银行卡">银行卡</option>
                            </select>
                        </div>
                    </div>
                    <div class="checkin-summary" style="background:#fef0f0;border-color:#fde2e2">
                        <div class="summary-item">
                            <span class="summary-label">应收合计</span>
                            <span class="summary-value highlight" id="coTotal">¥${roomFee}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">扣除押金后实收</span>
                            <span class="summary-value highlight" id="coActual" style="color:#67c23a">¥${Math.max(0, roomFee - checkin.deposit)}</span>
                        </div>
                    </div>
                </form>
            `
        });
        mask.querySelector('#coOther').oninput = () => {
            const other = parseFloat(mask.querySelector('#coOther').value) || 0;
            const total = roomFee + other;
            mask.querySelector('#coTotal').textContent = `¥${total}`;
            mask.querySelector('#coActual').textContent = `¥${Math.max(0, total - checkin.deposit)}`;
        };
        mask.querySelector('#modalConfirm').onclick = () => {
            const form = mask.querySelector('#coForm');
            const otherFee = parseFloat(form.otherFee.value) || 0;
            const total = roomFee + otherFee;
            const data = {
                customerId: checkin.customerId,
                roomId: room.id,
                guestName: checkin.guestName,
                checkInTime: checkin.checkInTime,
                checkOutTime: formatDateTime(nowDate),
                nights,
                roomFee,
                otherFee,
                total,
                paymentMethod: form.paymentMethod.value
            };
            DB.batch([
                { collection: 'checkouts', data },
                { collection: 'checkins', id: checkin.id, data: { status: '已退房' } },
                { collection: 'rooms', id: room.id, data: { status: '清洁中' } }
            ]);
            App.addLog(`办理退房 房间${room.roomNo}`);
            close();
            Toast.show(`退房成功，应收 ¥${total}`, 'success');
            App.refresh();
        };
    }
};

// ==================== 财务统计 ====================
Pages.finance = {
    render(container) {
        const checkouts = DB.get('checkouts');
        const totalIncome = checkouts.reduce((s, c) => s + c.total, 0);
        const totalRoomFee = checkouts.reduce((s, c) => s + c.roomFee, 0);
        const totalOtherFee = checkouts.reduce((s, c) => s + c.otherFee, 0);
        const totalNights = checkouts.reduce((s, c) => s + c.nights, 0);

        // 按支付方式统计
        const payStats = {};
        checkouts.forEach(c => { payStats[c.paymentMethod] = (payStats[c.paymentMethod] || 0) + c.total; });

        // 近7天收入
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = formatDate(d);
            const income = checkouts.filter(c => c.checkOutTime.startsWith(dateStr)).reduce((s, c) => s + c.total, 0);
            days.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, value: income || Math.floor(Math.random() * 500) + 200 });
        }

        container.innerHTML = `
            <div class="stat-cards">
                <div class="stat-card">
                    <div class="stat-icon green">💰</div>
                    <div class="stat-info">
                        <div class="stat-value">¥${totalIncome.toFixed(0)}</div>
                        <div class="stat-label">总营业额</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue">🏠</div>
                    <div class="stat-info">
                        <div class="stat-value">¥${totalRoomFee.toFixed(0)}</div>
                        <div class="stat-label">总房费收入</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">🛎️</div>
                    <div class="stat-info">
                        <div class="stat-value">¥${totalOtherFee.toFixed(0)}</div>
                        <div class="stat-label">其他收入</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red">📅</div>
                    <div class="stat-info">
                        <div class="stat-value">${totalNights}</div>
                        <div class="stat-label">总入住晚数</div>
                    </div>
                </div>
            </div>
            <div class="dashboard-row">
                <div class="card">
                    <div class="card-header"><span class="card-title">近7天收入趋势</span></div>
                    <div class="card-body">
                        <div class="bar-chart">
                            ${days.map(d => `
                                <div class="bar-item">
                                    <div class="bar-value">¥${d.value}</div>
                                    <div class="bar" style="height:${Math.min(d.value / 15, 150) + 20}px"></div>
                                    <div class="bar-label">${d.label}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title">支付方式占比</span></div>
                    <div class="card-body">
                        <table class="table">
                            <thead><tr><th>支付方式</th><th>金额</th><th>占比</th></tr></thead>
                            <tbody>
                                ${Object.entries(payStats).map(([method, amount]) => `
                                    <tr>
                                        <td>${method}</td>
                                        <td>¥${amount.toFixed(0)}</td>
                                        <td>${totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0}%</td>
                                    </tr>
                                `).join('')}
                                ${Object.keys(payStats).length === 0 ? '<tr><td colspan="3" class="empty">暂无数据</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">退房明细</span></div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>退房编号</th>
                            <th>客人</th>
                            <th>房间</th>
                            <th>退房时间</th>
                            <th>晚数</th>
                            <th>房费</th>
                            <th>其他</th>
                            <th>总计</th>
                            <th>支付方式</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${checkouts.map(c => `<tr>
                            <td>CO${String(c.id).padStart(4, '0')}</td>
                            <td>${c.guestName}</td>
                            <td>${c.roomId}</td>
                            <td>${c.checkOutTime}</td>
                            <td>${c.nights}</td>
                            <td>¥${c.roomFee}</td>
                            <td>¥${c.otherFee}</td>
                            <td style="color:#f56c6c">¥${c.total}</td>
                            <td>${c.paymentMethod}</td>
                        </tr>`).join('')}
                        ${checkouts.length === 0 ? '<tr><td colspan="9" class="empty">暂无数据</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
    }
};

// ==================== 员工管理 ====================
Pages.employee = {
    render(container) {
        const list = DB.get('employees');
        container.innerHTML = `
            <div class="filter-bar">
                <div class="filter-item">
                    <input class="filter-input" id="fKeyword" placeholder="搜索姓名/手机号">
                </div>
                <div class="filter-actions">
                    <button class="btn btn-primary" id="searchBtn">查询</button>
                    <button class="btn btn-primary" id="addBtn">+ 新增员工</button>
                </div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>姓名</th>
                            <th>性别</th>
                            <th>手机号</th>
                            <th>职位</th>
                            <th>部门</th>
                            <th>入职日期</th>
                            <th>状态</th>
                            <th width="140">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(e => `<tr>
                            <td>${e.name}</td>
                            <td>${e.gender}</td>
                            <td>${e.phone}</td>
                            <td>${e.position}</td>
                            <td>${e.dept}</td>
                            <td>${e.entryDate}</td>
                            <td><span class="tag ${e.status ? 'tag-success' : 'tag-info'}">${e.status ? '在职' : '离职'}</span></td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn btn-text" data-edit="${e.id}">编辑</button>
                                    <button class="btn btn-text" style="color:#f56c6c" data-del="${e.id}">删除</button>
                                </div>
                            </td>
                        </tr>`).join('')}
                        ${list.length === 0 ? '<tr><td colspan="8" class="empty">暂无数据</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('searchBtn').onclick = () => {
            const kw = document.getElementById('fKeyword').value.toLowerCase();
            container.querySelectorAll('tbody tr').forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(kw) ? '' : 'none';
            });
        };
        document.getElementById('addBtn').onclick = () => this.showForm();
        container.querySelectorAll('[data-edit]').forEach(el => {
            el.onclick = () => this.showForm(parseInt(el.dataset.edit));
        });
        container.querySelectorAll('[data-del]').forEach(el => {
            el.onclick = () => {
                Modal.confirm('确定要删除该员工吗？', () => {
                    DB.remove('employees', parseInt(el.dataset.del));
                    Toast.show('删除成功', 'success');
                    App.refresh();
                });
            };
        });
    },
    showForm(id) {
        const e = id ? DB.get('employees').find(x => x.id === id) : null;
        const { mask, close } = Modal.show({
            title: e ? '编辑员工' : '新增员工',
            body: `
                <form id="empForm">
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>姓名</label>
                            <input class="form-input" name="name" value="${e ? e.name : ''}">
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>性别</label>
                            <select class="form-select" name="gender">
                                <option value="男" ${e && e.gender === '男' ? 'selected' : ''}>男</option>
                                <option value="女" ${e && e.gender === '女' ? 'selected' : ''}>女</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>手机号</label>
                            <input class="form-input" name="phone" value="${e ? e.phone : ''}">
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>部门</label>
                            <select class="form-select" name="dept">
                                <option value="管理部" ${e && e.dept === '管理部' ? 'selected' : ''}>管理部</option>
                                <option value="前厅部" ${e && e.dept === '前厅部' ? 'selected' : ''}>前厅部</option>
                                <option value="客房部" ${e && e.dept === '客房部' ? 'selected' : ''}>客房部</option>
                                <option value="餐饮部" ${e && e.dept === '餐饮部' ? 'selected' : ''}>餐饮部</option>
                                <option value="财务部" ${e && e.dept === '财务部' ? 'selected' : ''}>财务部</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>职位</label>
                            <input class="form-input" name="position" value="${e ? e.position : ''}">
                        </div>
                        <div class="form-item">
                            <label class="form-label">入职日期</label>
                            <input class="form-input" name="entryDate" type="date" value="${e ? e.entryDate : formatDate(new Date())}">
                        </div>
                    </div>
                </form>
            `
        });
        mask.querySelector('#modalConfirm').onclick = () => {
            const form = mask.querySelector('#empForm');
            const data = {
                name: form.name.value.trim(),
                gender: form.gender.value,
                phone: form.phone.value.trim(),
                dept: form.dept.value,
                position: form.position.value.trim(),
                entryDate: form.entryDate.value,
                status: e ? e.status : 1
            };
            if (!data.name || !data.phone || !data.position) { Toast.show('请填写完整信息', 'error'); return; }
            if (e) { DB.update('employees', id, data); }
            else { DB.add('employees', data); }
            App.addLog(`${e ? '编辑' : '新增'}员工 ${data.name}`);
            close();
            Toast.show('保存成功', 'success');
            App.refresh();
        };
    }
};

// ==================== 用户管理 ====================
Pages.user = {
    render(container) {
        const list = DB.get('users');
        container.innerHTML = `
            <div class="filter-bar">
                <div class="filter-actions" style="margin-left:auto">
                    <button class="btn btn-primary" id="addBtn">+ 新增用户</button>
                </div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>用户名</th>
                            <th>姓名</th>
                            <th>角色</th>
                            <th>手机号</th>
                            <th>状态</th>
                            <th width="140">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(u => `<tr>
                            <td>${u.username}</td>
                            <td>${u.name}</td>
                            <td>${u.role}</td>
                            <td>${u.phone}</td>
                            <td><span class="tag ${u.status ? 'tag-success' : 'tag-info'}">${u.status ? '启用' : '停用'}</span></td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn btn-text" data-edit="${u.id}">编辑</button>
                                    <button class="btn btn-text" data-pwd="${u.id}">重置密码</button>
                                    ${u.username !== 'admin' ? `<button class="btn btn-text" style="color:#f56c6c" data-del="${u.id}">删除</button>` : ''}
                                </div>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('addBtn').onclick = () => this.showForm();
        container.querySelectorAll('[data-edit]').forEach(el => {
            el.onclick = () => this.showForm(parseInt(el.dataset.edit));
        });
        container.querySelectorAll('[data-pwd]').forEach(el => {
            el.onclick = () => {
                Modal.confirm('确定重置该用户密码为 123456 吗？', () => {
                    DB.update('users', parseInt(el.dataset.pwd), { password: '123456' });
                    Toast.show('密码已重置为 123456', 'success');
                });
            };
        });
        container.querySelectorAll('[data-del]').forEach(el => {
            el.onclick = () => {
                Modal.confirm('确定要删除该用户吗？', () => {
                    DB.remove('users', parseInt(el.dataset.del));
                    Toast.show('删除成功', 'success');
                    App.refresh();
                });
            };
        });
    },
    showForm(id) {
        const u = id ? DB.get('users').find(x => x.id === id) : null;
        const { mask, close } = Modal.show({
            title: u ? '编辑用户' : '新增用户',
            body: `
                <form id="userForm">
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>用户名</label>
                            <input class="form-input" name="username" value="${u ? u.username : ''}" ${u ? 'readonly' : ''}>
                        </div>
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>姓名</label>
                            <input class="form-input" name="name" value="${u ? u.name : ''}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-item">
                            <label class="form-label"><span class="required">*</span>角色</label>
                            <select class="form-select" name="role">
                                <option value="系统管理员" ${u && u.role === '系统管理员' ? 'selected' : ''}>系统管理员</option>
                                <option value="前台接待" ${u && u.role === '前台接待' ? 'selected' : ''}>前台接待</option>
                                <option value="财务" ${u && u.role === '财务' ? 'selected' : ''}>财务</option>
                            </select>
                        </div>
                        <div class="form-item">
                            <label class="form-label">手机号</label>
                            <input class="form-input" name="phone" value="${u ? u.phone : ''}">
                        </div>
                    </div>
                    ${!u ? `<div class="form-item">
                        <label class="form-label"><span class="required">*</span>初始密码</label>
                        <input class="form-input" name="password" value="123456">
                    </div>` : ''}
                </form>
            `
        });
        mask.querySelector('#modalConfirm').onclick = () => {
            const form = mask.querySelector('#userForm');
            const data = {
                username: form.username.value.trim(),
                name: form.name.value.trim(),
                role: form.role.value,
                phone: form.phone.value.trim()
            };
            if (!data.username || !data.name) { Toast.show('请填写完整信息', 'error'); return; }
            if (u) { DB.update('users', id, data); }
            else {
                data.password = form.password.value || '123456';
                data.status = 1;
                DB.add('users', data);
            }
            App.addLog(`${u ? '编辑' : '新增'}用户 ${data.username}`);
            close();
            Toast.show('保存成功', 'success');
            App.refresh();
        };
    }
};

// ==================== 系统参数 ====================
Pages.setting = {
    render(container) {
        const list = DB.get('settings');
        container.innerHTML = `
            <div class="card">
                <div class="card-header"><span class="card-title">系统参数设置</span></div>
                <div class="card-body">
                    <form id="settingForm">
                        <div class="form-row">
                            ${list.map(s => `
                                <div class="form-item">
                                    <label class="form-label">${s.label}</label>
                                    <input class="form-input" name="${s.key}" value="${s.value}">
                                </div>
                            `).join('')}
                        </div>
                        <div style="text-align:center;margin-top:20px">
                            <button type="button" class="btn btn-primary" id="saveSetting">保存设置</button>
                            <button type="button" class="btn" id="resetData" style="margin-left:10px;color:#f56c6c">重置全部数据</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('saveSetting').onclick = () => {
            const form = document.getElementById('settingForm');
            list.forEach(s => {
                DB.update('settings', s.id, { value: form[s.key].value });
            });
            Toast.show('设置保存成功', 'success');
        };
        document.getElementById('resetData').onclick = async () => {
            Modal.confirm('确定要重置全部数据吗？此操作不可恢复！', async () => {
                await DB.reset();
                Toast.show('数据已重置', 'success');
                setTimeout(() => location.reload(), 1000);
            });
        };
    }
};

// ==================== 操作日志 ====================
Pages.log = {
    render(container) {
        const list = DB.get('logs').sort((a, b) => b.id - a.id);
        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>序号</th>
                            <th>操作人</th>
                            <th>操作内容</th>
                            <th>操作时间</th>
                            <th>IP地址</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map((l, i) => `<tr>
                            <td>${i + 1}</td>
                            <td>${l.user}</td>
                            <td>${l.action}</td>
                            <td>${l.time}</td>
                            <td>${l.ip}</td>
                        </tr>`).join('')}
                        ${list.length === 0 ? '<tr><td colspan="5" class="empty">暂无日志</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
    }
};

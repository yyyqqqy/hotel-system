// ==================== 前端 API 服务层 ====================
const Api = {
    baseUrl: '', // 同域部署，使用相对路径

    // 通用请求方法
    async request(url, options = {}) {
        const config = {
            headers: { 'Content-Type': 'application/json' },
            ...options
        };
        if (config.body && typeof config.body !== 'string') {
            config.body = JSON.stringify(config.body);
        }
        try {
            const resp = await fetch(this.baseUrl + url, config);
            const json = await resp.json();
            if (json.code === 0) {
                return json.data;
            }
            throw new Error(json.msg || '请求失败');
        } catch (e) {
            console.error('API 请求失败:', url, e);
            throw e;
        }
    },

    get(url) {
        return this.request(url, { method: 'GET' });
    },

    post(url, data) {
        return this.request(url, { method: 'POST', body: data });
    },

    put(url, data) {
        return this.request(url, { method: 'PUT', body: data });
    },

    delete(url) {
        return this.request(url, { method: 'DELETE' });
    },

    // 认证
    login(username, password) {
        return this.post('/api/login', { username, password });
    },

    // 通用集合操作
    list(col) { return this.get(`/api/${col}`); },
    getById(col, id) { return this.get(`/api/${col}/${id}`); },
    create(col, data) { return this.post(`/api/${col}`, data); },
    update(col, id, data) { return this.put(`/api/${col}/${id}`, data); },
    remove(col, id) { return this.delete(`/api/${col}/${id}`); },

    // 批量操作
    batch(operations) {
        return this.post('/api/batch', { operations });
    },

    // 重置数据
    reset() {
        return this.post('/api/reset', {});
    }
};

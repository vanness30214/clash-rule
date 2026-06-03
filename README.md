# Docker 服务运行说明

本文档用于记录当前 3 个 Docker 服务的运行、维护和重建方式。

## 服务列表

当前包含以下 3 个服务：

| 服务名             | 镜像                                      |   宿主机端口 |    容器端口 | 说明              |
| --------------- | --------------------------------------- | ------: | ------: | --------------- |
| `sub-store`     | `xream/sub-store`                       |  `3001` |  `3001` | Sub-Store 服务    |
| `Sub2Converter` | `ghcr.io/metacubex/subconverter:latest` | `25500` | `25500` | Subconverter 服务 |
| `sub`           | `stilleshan/sub:latest`                 | `18080` |    `80` | 订阅转换前端/静态服务     |

---

## 1. 创建数据目录

`sub-store` 使用了宿主机目录挂载，需要先创建数据目录：

```bash
mkdir -p /opt/sub-store
```

---

## 2. 启动服务

### 2.1 启动 `sub-store`

```bash
docker run -d \
  --name sub-store \
  --restart always \
  -p 3001:3001 \
  -v /opt/sub-store:/opt/app/data \
  -e SUB_STORE_FRONTEND_BACKEND_PATH=/CKg3abstVnOeRpm1aB5G \
  --log-driver json-file \
  --log-opt max-size=50m \
  --log-opt max-file=2 \
  -it \
  xream/sub-store \
  /bin/sh -c 'mkdir -p /opt/app/data; cd /opt/app/data; SUB_STORE_DOCKER=true SUB_STORE_FRONTEND_PATH=/opt/app/frontend SUB_STORE_DATA_BASE_PATH=/opt/app/data node /opt/app/sub-store.bundle.js'
```

访问地址：

```text
http://服务器IP:3001
```

后台路径：

```text
/CKg3abstVnOeRpm1aB5G
```

完整访问地址示例：

```text
http://服务器IP:3001/CKg3abstVnOeRpm1aB5G
```

---

### 2.2 启动 `Sub2Converter`

```bash
docker run -d \
  --name Sub2Converter \
  --restart always \
  -p 25500:25500 \
  -e TZ=Asia/Shanghai \
  --log-driver json-file \
  --log-opt max-size=50m \
  --log-opt max-file=2 \
  ghcr.io/metacubex/subconverter:latest \
  /bin/sh -c 'subconverter'
```

访问地址：

```text
http://服务器IP:25500
```

---

### 2.3 启动 `sub`

```bash
docker run -d \
  --name sub \
  --restart always \
  -p 18080:80 \
  --log-driver json-file \
  --log-opt max-size=50m \
  --log-opt max-file=2 \
  stilleshan/sub:latest \
  sh -c '/app/start.sh'
```

访问地址：

```text
http://服务器IP:18080
```

---

## 3. 查看服务状态

查看所有正在运行的容器：

```bash
docker ps
```

查看所有容器，包括已停止的容器：

```bash
docker ps -a
```

查看指定容器状态：

```bash
docker ps -a | grep sub-store
docker ps -a | grep Sub2Converter
docker ps -a | grep sub
```

---

## 4. 查看日志

### 查看 `sub-store` 日志

```bash
docker logs -f sub-store
```

### 查看 `Sub2Converter` 日志

```bash
docker logs -f Sub2Converter
```

### 查看 `sub` 日志

```bash
docker logs -f sub
```

查看最近 100 行日志：

```bash
docker logs --tail=100 sub-store
docker logs --tail=100 Sub2Converter
docker logs --tail=100 sub
```

---

## 5. 停止服务

```bash
docker stop sub-store
docker stop Sub2Converter
docker stop sub
```

---

## 6. 启动已停止的服务

```bash
docker start sub-store
docker start Sub2Converter
docker start sub
```

---

## 7. 重启服务

```bash
docker restart sub-store
docker restart Sub2Converter
docker restart sub
```

---

## 8. 删除服务

删除前需要先停止容器：

```bash
docker stop sub-store Sub2Converter sub
```

然后删除容器：

```bash
docker rm sub-store Sub2Converter sub
```

注意：删除容器不会删除 `sub-store` 的本地数据目录 `/opt/sub-store`。

---

## 9. 重新部署服务

如果容器已经存在，需要先删除旧容器：

```bash
docker stop sub-store Sub2Converter sub
docker rm sub-store Sub2Converter sub
```

然后重新执行本文档第 2 节中的 `docker run` 命令。

---

## 10. 更新镜像并重建容器

### 10.1 拉取最新镜像

```bash
docker pull xream/sub-store
docker pull ghcr.io/metacubex/subconverter:latest
docker pull stilleshan/sub:latest
```

### 10.2 删除旧容器

```bash
docker stop sub-store Sub2Converter sub
docker rm sub-store Sub2Converter sub
```

### 10.3 重新运行容器

重新执行本文档第 2 节中的 3 条 `docker run` 命令。

---

## 11. 端口占用检查

如果启动失败，提示端口被占用，可以检查端口：

```bash
ss -tunlp | grep 3001
ss -tunlp | grep 25500
ss -tunlp | grep 18080
```

或者：

```bash
lsof -i:3001
lsof -i:25500
lsof -i:18080
```

---

## 12. 防火墙放行端口

如果外部无法访问，需要确认服务器安全组或防火墙已放行以下端口：

```text
3001
25500
18080
```

如果使用 `ufw`，可以执行：

```bash
ufw allow 3001/tcp
ufw allow 25500/tcp
ufw allow 18080/tcp
ufw reload
```

---

## 13. 常用排查命令

进入容器：

```bash
docker exec -it sub-store sh
docker exec -it Sub2Converter sh
docker exec -it sub sh
```

查看容器详细配置：

```bash
docker inspect sub-store
docker inspect Sub2Converter
docker inspect sub
```

查看容器资源占用：

```bash
docker stats
```

查看 Docker 磁盘占用：

```bash
docker system df
```

清理无用镜像和缓存：

```bash
docker system prune -a
```

注意：执行 `docker system prune -a` 会删除未使用的镜像，请确认没有需要保留的旧镜像。

---

## 14. 备份数据

目前只有 `sub-store` 配置了本地数据挂载目录：

```text
/opt/sub-store
```

建议定期备份：

```bash
tar -czvf sub-store-backup-$(date +%F).tar.gz /opt/sub-store
```

恢复时：

```bash
tar -xzvf sub-store-backup-YYYY-MM-DD.tar.gz -C /
```

---

## 15. 快速恢复流程

如果服务器重装或 Docker 服务丢失，可以按以下顺序恢复：

```bash
mkdir -p /opt/sub-store
```

如果有备份，先恢复：

```bash
tar -xzvf sub-store-backup-YYYY-MM-DD.tar.gz -C /
```

然后重新运行 3 个容器：

```bash
docker run -d \
  --name sub-store \
  --restart always \
  -p 3001:3001 \
  -v /opt/sub-store:/opt/app/data \
  -e SUB_STORE_FRONTEND_BACKEND_PATH=/CKg3abstVnOeRpm1aB5G \
  --log-driver json-file \
  --log-opt max-size=50m \
  --log-opt max-file=2 \
  -it \
  xream/sub-store \
  /bin/sh -c 'mkdir -p /opt/app/data; cd /opt/app/data; SUB_STORE_DOCKER=true SUB_STORE_FRONTEND_PATH=/opt/app/frontend SUB_STORE_DATA_BASE_PATH=/opt/app/data node /opt/app/sub-store.bundle.js'

docker run -d \
  --name Sub2Converter \
  --restart always \
  -p 25500:25500 \
  -e TZ=Asia/Shanghai \
  --log-driver json-file \
  --log-opt max-size=50m \
  --log-opt max-file=2 \
  ghcr.io/metacubex/subconverter:latest \
  /bin/sh -c 'subconverter'

docker run -d \
  --name sub \
  --restart always \
  -p 18080:80 \
  --log-driver json-file \
  --log-opt max-size=50m \
  --log-opt max-file=2 \
  stilleshan/sub:latest \
  sh -c '/app/start.sh'
```

---

## 16. 注意事项

1. `sub-store` 的数据保存在 `/opt/sub-store`，不要随意删除。
2. `SUB_STORE_FRONTEND_BACKEND_PATH` 是后台访问路径，建议不要公开泄露。
3. 如果修改端口，需要同步修改 `-p 宿主机端口:容器端口`。
4. 如果容器启动失败，优先查看日志：

```bash
docker logs --tail=100 容器名
```

5. 如果只是重启服务，不需要删除容器，直接执行：

```bash
docker restart 容器名
```

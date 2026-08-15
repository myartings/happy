# Happy 远端 Workspace 项目发现 Handoff

## Purpose

为 Happy 增加一个轻量、向后兼容的远端项目发现功能：用户选择一台在线 Machine 后，可以浏览和搜索该机器 `~/workspace` 下的项目，再沿用现有流程启动 Session。

核心问题是：Happy 当前 Working Directory 候选主要来自已有 Session 的历史路径。没有在 Happy 中启动过、或名字已经忘记的远端项目不会出现在候选列表中，用户只能手工输入准确路径。

本功能应命名为 **Workspace Project Discovery**，不要扩展成完整 Workspace Management。

## Repository / Entry Point

```text
Repository: /Users/myartings/workspace/happy
Current branch at handoff: dev
Current commit: f6617997 docs: record Studio integration merge
Current worktree: clean
Personal feature base: dev
```

后续实现必须从 `dev` 创建个人 feature 分支，通过仓库规定的正式生命周期：

```text
Start -> Plan -> Scope -> Build -> Verify -> Review -> Finish -> Archive
```

先读：

```text
/Users/myartings/workspace/happy/AGENTS.md
/Users/myartings/workspace/happy/.ai/project.json
/Users/myartings/workspace/happy/docs/workflow.md
```

## Current State

尚未修改 Happy 产品代码，也没有创建 spec、task 或 workflow workspace。本 handoff 只固定需求、设计边界和可执行的下一步。

现有 UI 证据：

- `/Users/myartings/workspace/happy/packages/happy-app/sources/app/(app)/new/index.tsx:833` 明确写着 `Build path items from session history for selected machine`。
- `/Users/myartings/workspace/happy/packages/happy-app/sources/components/HomeDock.tsx:503` 同样从现有 Session 路径生成 `projectOptions`。
- 手工路径输入、Machine 选择、Worktree 选择和 `spawn-happy-session` 已经存在，不应重写。

现有 RPC 接缝：

- `/Users/myartings/workspace/happy/packages/happy-cli/src/api/apiMachine.ts` 已通过动态 Machine RPC 注册 `spawn-happy-session`、worktree 和其他 handler。
- `/Users/myartings/workspace/happy/packages/happy-app/sources/sync/ops.ts` 已封装 `machineRPC` 调用。
- 新方法可以沿用动态 RPC 注册，不需要修改 Server 数据库或持久化协议。

## Official Upstream Status

Happy upstream roadmap 把 **Workspaces & Checkouts** 列为方向：

```text
Workspace = 可跨机器的逻辑项目
Checkout = 某个 Workspace 在某台机器上的具体工作副本
```

官方目标包括跨机器项目归并、daemon 管理 worktree/branch/checkout 生命周期，以及按 checkout 展示文件和变更。

但截至 2026-08-14：

- Roadmap 没有负责人、milestone 或交付时间。
- `slopus/happy#1169` 仍在 Backlog，没有维护者回复。
- 没有发现正在实现该项目选择功能的 upstream PR。
- 官方贡献规则把新功能排在 Bug/UI touchup 之后，并要求 RPC、同步引擎、Server 等核心变化先讨论。

参考：

- https://github.com/slopus/happy/blob/main/docs/roadmap.md#workspaces--checkouts
- https://github.com/slopus/happy/issues/1169
- https://github.com/slopus/happy/blob/main/docs/CONTRIBUTING.md

结论：官方认可方向，但不能依赖近期交付。个人 fork 可以先实现独立、可移除的轻量发现层。

## Workspace / Checkout Entity Meaning

完整官方模型大致是：

```text
Workspace: 逻辑项目，例如 Happy
  ├── Checkout: Mac /Users/myartings/workspace/happy
  ├── Checkout: Linux /home/myartings/workspace/happy
  └── Checkout: Mac feature worktree /Users/.../happy-feature-x
        └── Session: 在该具体副本中运行的 Agent 会话
```

如果真正引入实体，就需要稳定 ID、持久化、Machine/Session 关系、跨机器归并、迁移和生命周期管理。这会影响数据库、同步、RPC 和产品导航。

本功能明确不引入这些实体。扫描结果只是临时的绝对路径候选，选择后仍写入现有 `selectedPath`，Session 仍使用现有 `machineId + path` 模型。

## Accepted V1 Design

### User Flow

```text
Select Machine
  -> Open Working Directory picker
    -> Recent
       existing Session paths
    -> Workspace Projects
       projects discovered on that machine
    -> Search/select a path
      -> fill existing selectedPath
        -> existing Start Session flow
```

要求：

- `Recent` 保留现有行为并优先展示。
- `Workspace Projects` 只在目标 Machine 在线时按需加载。
- 两组路径按平台正确规范化后去重。
- 继续允许用户手工输入任意绝对路径。
- 扫描失败、超时、workspace 不存在或 daemon 版本较旧时，退回现有 Recent + 手工输入能力，不阻断启动。
- Machine 切换后重新加载对应机器项目，不能混用上一台机器的结果。

### Discovery Scope

默认根：

```text
macOS/Linux:  ~/workspace
Windows:      %USERPROFILE%\workspace
```

V1 不提供多 root 设置页面。扫描规则：

- 最大深度默认 3，最多返回约 200 个项目。
- 跳过 `.git`、`node_modules`、`.venv`、`venv`、`__pycache__`、`.next`、`.turbo`、`Library`、`DerivedData`、`target`、`build`、`dist` 等目录。
- 使用 marker 判断项目，例如 `.git`、`package.json`、`pyproject.toml`、`Cargo.toml`、`go.mod`、`Package.swift`、`*.xcodeproj`、`*.xcworkspace`、`*.sln`、`*.uproject`、Unity 标记目录等。
- 只读取目录名、类型、marker 是否存在；不读取源文件内容，不运行项目脚本，不执行 Git 命令。

建议响应：

```ts
type WorkspaceProject = {
  name: string;
  path: string;
  relativePath: string;
  markers: string[];
  depth: number;
};

type ListWorkspaceProjectsResult = {
  root: string;
  projects: WorkspaceProject[];
  scannedAt: number;
  truncated: boolean;
};
```

### RPC Boundary

增加一个只读、可选的 Machine RPC：

```text
list-workspace-projects
```

要求：

- 由 CLI/daemon 在目标机器本地扫描。
- App 不通过 `machineBash` 拼 shell 命令，也不递归发送大量 `listDirectory` 请求。
- 不修改 Happy Server 数据库、Sync Engine 或 `spawn-happy-session`。
- 不把结果写入 Machine metadata 或 Session metadata。
- App 对 `RPC_METHOD_NOT_AVAILABLE` 做向后兼容：旧 daemon 继续使用原有路径候选。
- 只在 picker 打开且 Machine 在线时调用；App 内存缓存约 30–60 秒，V1 不做磁盘持久化和后台 watcher。

## Reference Implementations

### Primary Reference: Existing Personal Scanner

核心算法直接参考：

```text
/Users/myartings/.agents/skills/workspace-projects/scripts/list_workspace_projects.py
```

它已经实现 marker 权重、最大深度、skip directories、搜索、评分和去重。不要让 Happy 运行该 Python Skill；将必要逻辑移植成 Happy CLI 内部 TypeScript，避免 Python 和个人 Skill 成为产品依赖。

### Codex Desktop

Codex Desktop 可参考项目模型，但不能直接复用前端代码。本机状态只读审计显示其项目对象大致包含：

```text
local-projects: id, name, rootPaths, createdAt, updatedAt
selected-project
project-order
active-workspace-roots
electron-saved-workspace-roots
```

它适合未来持久化 Workspace 模型参考，但偏向“用户已经添加的 Project”，不能直接解决远端机器 `~/workspace` 全量发现。

公开 `openai/codex` 仓库主要提供 CLI、Rust core 和 app-server，Codex Desktop Electron 前端没有完整公开：

```text
https://github.com/openai/codex
```

Superset/OpenCode 可以研究 host-owned workspace 和 worktree 生命周期，但架构远超当前需求。V1 不引入其数据库、watcher、workspace lifecycle 或跨机器归并方案。

## Expected Change Surface

最终文件由正式 Plan/Spec 决定，但预期控制在以下区域：

```text
packages/happy-cli/src/.../workspaceProjectScanner.ts
packages/happy-cli/src/.../workspaceProjectScanner.test.ts
packages/happy-cli/src/api/apiMachine.ts
packages/happy-app/sources/sync/ops.ts
packages/happy-app/sources/app/(app)/new/index.tsx
packages/happy-app/sources/components/HomeDock.tsx
packages/happy-app/sources/utils/...test.ts
```

尽量先提取一个纯函数负责：

```text
recent paths + discovered projects + selected path
  -> normalized, deduplicated picker sections
```

避免在两个大型 React 文件中复制业务逻辑。

## Explicit Non-Goals

- 不新增 Workspace ID 或 Checkout ID。
- 不新增数据库表或迁移。
- 不修改 Happy Server、Sync Engine、加密协议或 Session protocol。
- 不做跨机器项目自动归并。
- 不根据 Git remote 建立逻辑 Workspace。
- 不管理 branch、worktree 或 checkout 生命周期。
- 不做后台持续扫描、文件 watcher 或云端持久化。
- 不删除或替代 Recent paths。
- 不改变手工路径输入。
- 不改变 Session spawn、resume、fork 或 worktree 行为。
- 不顺带重构 New Session 页面。

## Implementation Sequence

1. 使用 `start` 初始化 `docs/workspace/remote-workspace-project-discovery/`。
2. 用 `create-prd` 固定用户结果、兼容行为和非目标。
3. 用 `decision-map` 只解决仍开放的选择，不重新打开已接受的轻量边界。
4. 用 `generate-spec` 写可验证 contract。
5. 用 `generate-tasks` 拆成 scanner、RPC、App data layer、picker UI、验证五个小切片。
6. `scoping` 确认这是 Feature；新增 Machine RPC 需记录 core-boundary 影响，但保持 Server/Sync 不变。
7. `tdd` 先写 scanner 和合并/去重纯函数测试。
8. `implement` 逐切片完成。
9. `check`、`review`、`finish-work` 完成验证、审阅、归档和授权提交。

## Acceptance Criteria

- 选择在线 Machine 后，Working Directory picker 能列出该机器 `~/workspace` 下从未启动过 Happy Session 的项目。
- 可以按项目名称和绝对/相对路径搜索。
- Recent paths 保持原有内容和优先级。
- Recent 与 discovered 相同路径只显示一次；macOS/Linux/Windows 路径分别正确规范化。
- 选择 discovered project 后，只更新现有 `selectedPath`，Start Session 使用现有流程成功启动。
- 手工路径输入仍然可用。
- workspace 根不存在、无权限、扫描超时或结果被截断时有可理解的非阻断状态。
- 旧 daemon 没有新 RPC 时，App 不崩溃，仍可用 Recent 和手工路径。
- 切换 Machine 不会展示前一台机器的扫描结果。
- 扫描不会进入 skip directories，不读取项目文件内容，不运行项目命令。
- 不产生 Server、DB、Sync、Session protocol 或 `spawn-happy-session` 变更。
- macOS、Linux、Windows Native 至少有路径单测；开发机器上完成一次真实 daemon + App picker smoke。

## Validation Plan

最低确定性检查：

```bash
pnpm --filter happy typecheck
pnpm --filter happy-app typecheck
pnpm --filter happy exec vitest run <scanner-test>
pnpm --filter happy-app exec vitest run <picker-data-test>
python3 scripts/validate-happy-workflow.py
python3 scripts/test-workflow-core.py
python3 scripts/test-workflow-ci.py
python3 scripts/workflow-audit.py --strict --require-active
```

真实 smoke：

1. 用开发 CLI 安装并重启 daemon。
2. 在 `~/workspace` 下准备一个从未出现在 Happy Session 历史中的测试项目。
3. 打开 Happy New Session，选择对应 Machine。
4. 打开 Working Directory picker，确认该项目出现并可搜索。
5. 选择项目并启动 Codex/Claude Session，确认 metadata path 正确。
6. 测试旧 daemon 或模拟 `RPC_METHOD_NOT_AVAILABLE`，确认现有功能无回归。
7. 截图或录屏记录 before/after；若准备 upstream PR，这是官方 CONTRIBUTING 要求的证据。

## Known Decisions Still Open

1. Home Dock 与完整 New Session 页面是否同一版本接入。建议共享 data helper；风险较高时先完整 New Session。
2. picker 显示两个 section，还是用 badge 区分来源。建议两个 section。
3. 是否显示 marker。建议只在空间充足时显示 1–2 个简短 marker。
4. scan timeout 和上限。建议 2–3 秒、200 项，以真实 workspace benchmark 决定。

## Safety / Compatibility Notes

- Machine RPC 返回绝对路径，属于本机结构信息。沿用现有加密 Machine RPC，不在日志打印完整结果，不上传为 Server 持久化数据。
- 不通过 shell 拼接用户路径，避免 Windows quoting 和命令注入。
- Scanner 必须处理权限错误、符号链接循环、目录扫描中消失。
- 不跟随指向 workspace root 外部的符号链接；基于 resolved path 做 root containment。
- 不扫描 home、根目录、网络盘或可移动盘；V1 固定在 `~/workspace`。
- App 必须把 capability/RPC failure 当作正常兼容分支，不能要求所有机器同时升级才能继续启动 Session。

## Review Checklist

- [ ] `git status --short --branch` 与 feature scope 一致。
- [ ] diff 没有 Server、DB、Sync Engine、Session protocol 的意外改动。
- [ ] Scanner 是纯只读、有界、跨平台的。
- [ ] 新 RPC 可选且旧 daemon 回退通过测试。
- [ ] 两处项目选择 UI 没有复制 divergent 业务逻辑。
- [ ] 手工路径、Recent、Worktree、Agent/权限选择和 Start Session 无回归。
- [ ] 测试、typecheck、workflow audit 与真实 smoke 有证据。
- [ ] 没有凭据、Session 内容、机器私有项目清单或日志进入 Git。

## Suggested Skills

```text
start
create-prd
decision-map
generate-spec
generate-tasks
scoping
tdd
implement
check
review
finish-work
```

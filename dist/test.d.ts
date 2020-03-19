type FuncVoid = () => void;

declare namespace wx {
    /**
     * 批量添加卡券。
     */
    export function getUpdateManager(): UpdateManager;
}

interface UpdateManager {
    onUpdateFailed(callback: FuncVoid): void;
}

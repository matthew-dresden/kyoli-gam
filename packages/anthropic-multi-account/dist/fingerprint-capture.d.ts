declare const LIVE_TTL_MS: number;
declare const SUPPORTED_CC_RANGE: {
    readonly min: "1.0.0";
    readonly maxTested: string;
};
type TemplateSource = "bundled" | "cached" | "live";
type TemplateTool = {
    name: string;
    [key: string]: unknown;
};
interface TemplateData {
    _version: number;
    _schemaVersion?: number;
    _captured: string;
    _source: TemplateSource;
    agent_identity: string;
    system_prompt: string;
    system_prompt_fable?: string;
    system_prompt_variants?: Record<string, string>;
    tools: TemplateTool[];
    tool_names: string[];
    anthropic_beta?: string;
    cc_version?: string;
    header_order?: string[];
    header_values?: Record<string, string>;
    body_field_order?: string[];
}
interface CapturedRequest {
    body: Record<string, unknown>;
    headers: Record<string, string>;
    rawHeaders: string[];
}
interface DriftResult {
    drifted: boolean;
    cachedVersion: string | null;
    installedVersion: string | null;
    message: string;
}
interface CompatResult {
    status: "unknown" | "below-min" | "untested-above" | "ok";
    installedVersion: string | null;
    range: typeof SUPPORTED_CC_RANGE;
    message: string;
}
interface FingerprintCaptureTestOverrides {
    now?: () => number;
    getConfigDir?: () => string;
    findClaudeBinary?: () => string | null;
    runClaudeCapture?: (params: {
        binaryPath: string;
        baseUrl: string;
        timeoutMs: number;
        model?: string;
    }) => Promise<void>;
    detectCliVersion?: () => string;
}
declare function prepareBundledTemplate(template: TemplateData): TemplateData;
declare function matchesBundledClaudeCodeFingerprint(template: TemplateData, reference?: TemplateData): boolean;
declare function loadTemplate(): TemplateData;
declare function extractTemplate(captured: CapturedRequest): TemplateData | null;
declare function captureLiveTemplateAsync(timeoutMs?: number, options?: {
    cacheControlEvidencePath?: string;
    model?: string;
}): Promise<TemplateData | null>;
declare function refreshLiveFingerprintAsync(options?: {
    force?: boolean;
    silent?: boolean;
    timeoutMs?: number;
}): Promise<TemplateData | null>;
declare function compareVersions(left: string, right: string): number | null;
declare function detectDrift(template: TemplateData, installedOverride?: string | null): DriftResult;
declare function checkCCCompat(installedOverride?: string | null): CompatResult;
declare function setFingerprintCaptureTestOverridesForTest(overrides: FingerprintCaptureTestOverrides | null): void;
declare function resetFingerprintCaptureForTest(): void;

export { type CapturedRequest, type CompatResult, type DriftResult, LIVE_TTL_MS, SUPPORTED_CC_RANGE, type TemplateData, captureLiveTemplateAsync, checkCCCompat, compareVersions, detectDrift, extractTemplate, loadTemplate, matchesBundledClaudeCodeFingerprint, prepareBundledTemplate, refreshLiveFingerprintAsync, resetFingerprintCaptureForTest, setFingerprintCaptureTestOverridesForTest };

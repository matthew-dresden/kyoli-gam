interface ScrubTemplateOptions {
    dropMcpTools?: boolean;
}
interface TemplateToolLike {
    name: string;
    [key: string]: unknown;
}
interface TemplateLike {
    agent_identity: string;
    system_prompt: string;
    system_prompt_fable?: string;
    system_prompt_variants?: Record<string, string>;
    tools: TemplateToolLike[];
    tool_names: string[];
    header_order?: string[];
    header_values?: Record<string, string>;
}
declare function scrubText(text: string): string;
declare function findUserPathHits(text: string): string[];
declare function removeHostContextSections(systemPrompt: string): string;
declare function scrubSystemPrompt(systemPrompt: string): string;
declare function scrubObjectStrings(value: unknown): unknown;
declare function scrubTemplate<T extends TemplateLike>(data: T, options?: ScrubTemplateOptions): T;

export { findUserPathHits, removeHostContextSections, scrubObjectStrings, scrubSystemPrompt, scrubTemplate, scrubText };

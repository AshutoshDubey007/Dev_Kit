import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Production Pipeline Quality: AI Studio Provider & Output Invariants', () => {
  describe('Provider Availability Detection & Honest Reporting', () => {
    function detectConfiguredProviders(env: Record<string, string | undefined>): {
      configured: boolean;
      activeProviders: string[];
    } {
      const activeProviders: string[] = [];
      if (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY !== 'mock') activeProviders.push('anthropic');
      if (env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'mock') activeProviders.push('openai');
      if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'mock') activeProviders.push('gemini');

      return {
        configured: activeProviders.length > 0,
        activeProviders,
      };
    }

    it('reports providerConfigured: false when all AI keys are absent', () => {
      const status = detectConfiguredProviders({});
      assert.equal(status.configured, false);
      assert.equal(status.activeProviders.length, 0);
    });

    it('reports providerConfigured: true when at least one valid key is present', () => {
      const status = detectConfiguredProviders({ ANTHROPIC_API_KEY: 'sk-ant-live-key' });
      assert.equal(status.configured, true);
      assert.deepEqual(status.activeProviders, ['anthropic']);
    });

    it('ignores dummy or mock keys in production environment check', () => {
      const status = detectConfiguredProviders({ OPENAI_API_KEY: 'mock' });
      assert.equal(status.configured, false);
    });
  });

  describe('Generated Project Data Integrity', () => {
    interface GeneratedProject {
      projectId: string;
      title: string;
      files: Record<string, string>;
      generatedAt: Date;
    }

    function validateProjectStructure(project: GeneratedProject): boolean {
      if (!project.projectId || !project.title) return false;
      if (!project.files || Object.keys(project.files).length === 0) return false;
      // Essential file: package.json must be present in scaffolded project
      if (!project.files['package.json']) return false;
      return true;
    }

    it('requires generated project to contain essential package.json and project files', () => {
      const validProject: GeneratedProject = {
        projectId: 'proj_gen_123',
        title: 'Next.js 15 Auth Starter',
        files: {
          'package.json': '{"name": "auth-starter"}',
          'README.md': '# Auth Starter',
        },
        generatedAt: new Date(),
      };
      assert.equal(validateProjectStructure(validProject), true);
    });

    it('rejects project missing package.json', () => {
      const invalidProject: GeneratedProject = {
        projectId: 'proj_gen_456',
        title: 'Incomplete Project',
        files: {
          'README.md': '# Just a readme',
        },
        generatedAt: new Date(),
      };
      assert.equal(validateProjectStructure(invalidProject), false);
    });
  });
});

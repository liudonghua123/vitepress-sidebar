import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

declare interface Options {
  root?: string;
  rootGroupText?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  hyphenToSpace?: boolean;
  underscoreToSpace?: boolean;
}

declare interface SidebarItem {
  [key: string]: any;
}

export default class VitePressSidebar {
  static generateSidebar(options: Options): object {
    options.root = options?.root ?? '/';
    if (!/^\//.test(options.root)) {
      options.root = `/${options.root}`;
    }

    options.rootGroupText = options?.rootGroupText ?? 'Table of Contents';
    options.collapsible = options?.collapsible ?? true;
    options.hyphenToSpace = options?.hyphenToSpace ?? true;

    const sidebar: SidebarItem = VitePressSidebar.generateSidebarItem(
      join(process.cwd(), options.root),
      options.root,
      options
    );

    if (!sidebar.items) {
      return [
        {
          text: options.rootGroupText,
          items: sidebar,
          collapsible: options.collapsible,
          collapsed: !!options.collapsed
        }
      ];
    }

    return sidebar;
  }

  static generateSidebarItem(
    currentDir: string,
    displayDir: string,
    options: Options
  ): SidebarItem {
    const directoryFiles: string[] = readdirSync(currentDir);

    return directoryFiles
      .map((x: string) => {
        const childItemPath = resolve(currentDir, x);
        const childItemPathDisplay = `${displayDir}/${x}`
          .replace(/\/{2}/, '/')
          .replace(/\.md$/, '');

        if (/\.vitepress/.test(childItemPath)) {
          return null;
        }

        if (statSync(childItemPath).isDirectory()) {
          return {
            text: VitePressSidebar.getTitleFromMd(x, options, true),
            items:
              VitePressSidebar.generateSidebarItem(childItemPath, childItemPathDisplay, options) ||
              [],
            collapsible: options.collapsible,
            collapsed: !!options.collapsed
          };
        }
        if (childItemPath.endsWith('.md')) {
          return {
            text: VitePressSidebar.getTitleFromMd(x, options),
            link: childItemPathDisplay
          };
        }
        return null;
      })
      .filter((x) => x !== null);
  }

  static getTitleFromMd(fileName: string, options: Options, isDirectory = false): string {
    let result: string = fileName.charAt(0).toUpperCase() + fileName.slice(1);

    if (!isDirectory) {
      result = result.replace(/\.md$/, '');
    }

    if (options.hyphenToSpace) {
      result = result.replace(/-/g, ' ');
    }

    if (options.underscoreToSpace) {
      result = result.replace(/_/g, ' ');
    }

    return result;
  }
}

export { VitePressSidebar };

export const { generateSidebar } = VitePressSidebar;

export function completeHtml(markup: string, css: string): string {
  const styles = `<style>\n${css.replace(/<\/style/gi, "<\\/style")}\n</style>`;
  const trimmed = markup.trim();
  if (/<!doctype|<html[\s>]/i.test(trimmed)) {
    if (/<\/head>/i.test(trimmed)) return trimmed.replace(/<\/head>/i, `${styles}\n</head>`);
    return trimmed.replace(/<html([^>]*)>/i, `<html$1><head><meta charset="UTF-8">${styles}</head>`);
  }
  return `<!DOCTYPE html>\n<html lang="id" xmlns:th="http://www.thymeleaf.org">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Dokumen PDF</title>\n${styles}\n</head>\n<body>\n${trimmed}\n</body>\n</html>`;
}

type Data = Record<string, unknown>;

function lookup(expression: string, scope: Data): unknown {
  const key = expression.trim();
  if (!/^[\w.]+$/.test(key)) return undefined;
  return key.split(".").reduce<unknown>((value, part) => value && typeof value === "object" ? (value as Data)[part] : undefined, scope);
}

function interpolate(value: string, scope: Data): string {
  return value.replace(/\[\[\$\{([^}]+)\}\]\]/g, (_, expression: string) => String(lookup(expression, scope) ?? ""));
}

export function previewHtml(markup: string, css: string, sample: Data): string {
  const doc = new DOMParser().parseFromString(completeHtml(markup, css), "text/html");
  const visit = (element: Element, scope: Data) => {
    const each = element.getAttribute("th:each");
    if (each) {
      const match = each.match(/^\s*(\w+)\s*:\s*\$\{([^}]+)\}\s*$/);
      const collection = match ? lookup(match[2], scope) : undefined;
      if (match && Array.isArray(collection)) {
        for (const value of collection) {
          const clone = element.cloneNode(true) as Element;
          clone.removeAttribute("th:each");
          element.parentNode?.insertBefore(clone, element);
          visit(clone, { ...scope, [match[1]]: value });
        }
        element.remove();
        return;
      }
    }
    const text = element.getAttribute("th:text");
    if (text) {
      const expression = text.match(/^\$\{([^}]+)\}$/);
      if (expression) element.textContent = String(lookup(expression[1], scope) ?? "");
      element.removeAttribute("th:text");
    }
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith("th:")) element.removeAttribute(attribute.name);
      else if (attribute.value.includes("[[${")) element.setAttribute(attribute.name, interpolate(attribute.value, scope));
    }
    for (const child of Array.from(element.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent?.includes("[[${")) child.textContent = interpolate(child.textContent, scope);
      else if (child.nodeType === Node.ELEMENT_NODE) visit(child as Element, scope);
    }
  };
  visit(doc.body, sample);
  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
}

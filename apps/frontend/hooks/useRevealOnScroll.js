"use client";
import { useEffect } from 'react';

const HIDDEN_CLASSES = ['opacity-0', 'translate-y-6'];
const VISIBLE_CLASSES = ['opacity-100', 'translate-y-0'];

function applyClasses(element, toAdd = [], toRemove = []) {
  if (!element) return;
  if (toAdd.length) element.classList.add(...toAdd);
  if (toRemove.length) element.classList.remove(...toRemove);
}

export default function useRevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            applyClasses(entry.target, VISIBLE_CLASSES, HIDDEN_CLASSES);
            entry.target.dataset.revealVisible = 'true';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const registerElement = (element) => {
      if (!(element instanceof HTMLElement)) return;
      if (element.dataset.revealVisible === 'true') return;
      if (!element.dataset.revealReady) {
        applyClasses(element, ['transition', 'duration-700', 'ease-out']);
        applyClasses(element, HIDDEN_CLASSES);
        element.dataset.revealReady = 'true';
      }
      observer.observe(element);
    };

    document.querySelectorAll('[data-reveal]').forEach(registerElement);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches('[data-reveal]')) {
            registerElement(node);
          }
          node.querySelectorAll?.('[data-reveal]').forEach(registerElement);
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}

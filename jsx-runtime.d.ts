import { IntrinsicElements as IntrinsicElementsDefined } from "./";

export function jsxDEV(
  tag: string | Function,
  props: Record<string, unknown>,
): VNode;

export function jsx(
  tag: string | Function,
  props: Record<string, unknown>,
): VNode;

export function jsxs(
  tag: string | Function,
  props: Record<string, unknown>,
): VNode;

export function isValidElement(node: any): node is VNode;

type VNode = {
  $$typeof: Symbol;
  tag: string | Function;
  props: Record<string, unknown>;
  children: Children[];
};

export type Children = string | number | VNode | Children[];

export function renderJsx(
  tag: string | Function,
  props: Record<string, unknown>,
  ...children: Children[]
): string;

export function Fragment(props: { children: Children[] }): VNode;

type Props = Record<string, any>;

declare global {
  namespace JSX {
    type Element = string;
    interface ElementChildrenAttribute {
      children: Children;
    }
    interface IntrinsicElements extends IntrinsicElementsDefined {
      [tagName: string]: Props;
    }
  }
}

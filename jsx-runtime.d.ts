import { IntrinsicElements as IntrinsicElementsDefined } from "./";

export function jsxDEV(
  tag: string | ComponentType<any>,
  props: Record<string, unknown>,
): VNode;

export function jsx(
  tag: string | ComponentType<any>,
  props: Record<string, unknown>,
): VNode;

export function jsxs(
  tag: string | ComponentType<any>,
  props: Record<string, unknown>,
): VNode;

export function isValidElement(node: any): node is VNode;

export type VNode = {
  $$typeof: Symbol;
  tag: string | ComponentType<any>;
  props: Record<string, unknown>;
  children: Children[];
};

export type Children = string | number | VNode | Children[];

export function renderJsx(
  tag: string | ComponentType<any>,
  props: Record<string, unknown>,
  ...children: Children[]
): Promise<string>;

export type ComponentType<P = {}> = (props: P) => VNode | Promise<VNode>;

export function Fragment(props: { children: Children[] }): VNode;

type Props = Record<string, any>;

declare global {
  namespace JSX {
    type Element = VNode;

    interface ElementChildrenAttribute {
      children: Children;
    }

    interface IntrinsicElements extends IntrinsicElementsDefined {
      [tagName: string]: Props;
    }

    export type ElementType = keyof IntrinsicElements | ComponentType<any>;
  }
}

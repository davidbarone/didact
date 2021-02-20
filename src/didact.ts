import { render, createElement, fragment } from './core';
import { useState } from './useState';
import { useEffect } from './useEffect';
//import { useEffect } from './useEffect';
import { useMemo } from './useMemo';
import { useCallback } from './useCallback';
//import { useRef } from './hooks/use-ref';

export default {
  render: render,
  createElement: createElement,
  fragment: fragment,
  useState: useState,
  useEffect: useEffect,
  useMemo: useMemo,
  useCallback: useCallback,
  //useRef
}
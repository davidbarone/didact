import { render, createElement } from './core';
import { useState } from './useState';
import { useEffect } from './useEffect';
//import { useEffect } from './useEffect';
//import { useMemo } from './hooks/use-memo';
//import { useCallback } from './hooks/use-callback';
//import { useRef } from './hooks/use-ref';

export default {
  render: render,
  createElement: createElement,
  useState: useState,
  useEffect: useEffect,
  //useMemo,
  //useCallback,
  //useRef
}
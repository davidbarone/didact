import { render, createElement } from './core';
import { useState } from './useState';
import { useEffect } from './useEffect';
//import { useEffect } from './useEffect';
import { useMemo } from './useMemo';
//import { useCallback } from './hooks/use-callback';
//import { useRef } from './hooks/use-ref';

export default {
  render: render,
  createElement: createElement,
  useState: useState,
  useEffect: useEffect,
  useMemo: useMemo,
  //useCallback,
  //useRef
}
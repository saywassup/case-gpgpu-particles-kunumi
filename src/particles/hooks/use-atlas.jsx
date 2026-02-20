//** Libs */
import React, { useEffect, useState } from "react";
import { Texture, LinearMipMapLinearFilter, LinearFilter, ClampToEdgeWrapping } from "three";

// Utility: load a single image
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // allow CORS
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Utility: nearest power of two
function potSize(n) {
  return 2 ** Math.ceil(Math.log2(n));
}

/**
 * React hook to create an atlas texture from images
 * @param {string[]} urls - list of image URLs
 * @param {number} cellSize - size of each cell (square)
 * @returns {{atlas: HTMLCanvasElement|null, uvs: {u0:number,v0:number,u1:number,v1:number}[]}|null}
 */
export function useImageAtlas(urls, cellSize = 128) {
  const [atlas, setAtlas] = useState(null);
  const [texture, setTexture] = useState(null);
  const [uvs, setUvs] = useState([]);

  useEffect(() => {
    if (!urls || urls.length === 0) return;

    let isCancelled = false;

    async function buildAtlas() {
      let imageURLS = []; // WIP

      const images = await Promise.all(imageURLS.map(loadImage));

      const count = images.length;
      const gridSize = Math.ceil(Math.sqrt(count));
      const atlasSize = potSize(gridSize * cellSize);

      const canvas = document.createElement("canvas");
      canvas.width = atlasSize;
      canvas.height = atlasSize;
      const ctx = canvas.getContext("2d");

      const uvList = [];

      images.forEach((img, i) => {
        const gx = i % gridSize;
        const gy = Math.floor(i / gridSize);

        const x = gx * cellSize;
        const y = gy * cellSize;

        // keep aspect ratio
        const scale = Math.min(cellSize / img.width, cellSize / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const dx = x + (cellSize - w) / 2;
        const dy = y + (cellSize - h) / 2;

        ctx.clearRect(x, y, cellSize, cellSize);
        ctx.drawImage(img, dx, dy, w, h);

        uvList.push({
          u0: x / atlasSize,
          v0: y / atlasSize,
          u1: (x + cellSize) / atlasSize,
          v1: (y + cellSize) / atlasSize,
        });
      });

      if (!isCancelled) {
        const tex = new Texture(canvas);
        tex.needsUpdate = true;
        tex.minFilter = LinearMipMapLinearFilter;
        tex.magFilter = LinearFilter;
        tex.wrapS = ClampToEdgeWrapping;
        tex.wrapT = ClampToEdgeWrapping;

        setTexture(tex);
        setAtlas(canvas);
        setUvs(uvList);
      }
    }

    buildAtlas();

    return () => {
      isCancelled = true;
    };
  }, [urls, cellSize]);

  return { atlas, texture, uvs };
}

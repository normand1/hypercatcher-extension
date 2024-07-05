// vite.config.ts
import { defineConfig } from "file:///Users/davidnorman/Hypercatcher/hypercatcher-extension/hypercatcher-extension/node_modules/vite/dist/node/index.js";
import { crx } from "file:///Users/davidnorman/Hypercatcher/hypercatcher-extension/hypercatcher-extension/node_modules/@crxjs/vite-plugin/dist/index.mjs";
import react from "file:///Users/davidnorman/Hypercatcher/hypercatcher-extension/hypercatcher-extension/node_modules/@vitejs/plugin-react/dist/index.mjs";

// src/manifest.ts
import { defineManifest } from "file:///Users/davidnorman/Hypercatcher/hypercatcher-extension/hypercatcher-extension/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// package.json
var package_default = {
  name: "Hypercatcher-ChapterSync",
  displayName: "Hypercatcher Extension",
  version: "0.0.5",
  author: "David Norman",
  description: "",
  type: "module",
  license: "MIT",
  keywords: [
    "hypercatcher",
    "podcast",
    "chapters"
  ],
  engines: {
    node: ">=14.18.0"
  },
  scripts: {
    dev: "vite",
    build: "tsc && vite build",
    preview: "vite preview",
    fmt: "prettier --write '**/*.{tsx,ts,json,css,scss,md}'",
    watch: "./watch-and-build.sh"
  },
  dependencies: {
    react: "^18.2.0",
    "react-dom": "^18.2.0"
  },
  devDependencies: {
    "@crxjs/vite-plugin": "^2.0.0-beta.19",
    "@types/chrome": "^0.0.246",
    "@types/react": "^18.2.28",
    "@types/react-dom": "^18.2.13",
    "@vitejs/plugin-react": "^4.1.0",
    prettier: "^3.0.3",
    typescript: "^5.2.2",
    vite: "^4.4.11"
  }
};

// src/manifest.ts
var manifest_default = defineManifest({
  name: package_default.name,
  description: package_default.description,
  version: package_default.version,
  manifest_version: 3,
  icons: {
    16: "img/logo-16.png",
    32: "img/logo-34.png",
    48: "img/logo-48.png",
    128: "img/logo-128.png"
  },
  action: {
    default_popup: "popup.html",
    default_icon: "img/logo-48.png"
  },
  // options_page: 'options.html',
  // devtools_page: 'devtools.html',
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  content_scripts: [
    {
      matches: [
        "*://*.rssblue.com/*",
        "*://podcasters.spotify.com/*",
        "*://*.buzzsprout.com/*",
        "*://publish.blubrry.com/*"
      ],
      js: ["src/contentScript/hcindex.ts"]
    }
  ],
  // side_panel: {
  //   default_path: 'sidepanel.html',
  // },
  web_accessible_resources: [
    {
      resources: ["img/logo-16.png", "img/logo-34.png", "img/logo-48.png", "img/logo-128.png"],
      matches: []
    }
  ],
  permissions: ["storage", "activeTab", "tabs", "contextMenus", "notifications"]
  // 'sidePanel'
});

// vite.config.ts
var vite_config_default = defineConfig(({ mode }) => {
  return {
    build: {
      emptyOutDir: true,
      outDir: "build",
      rollupOptions: {
        output: {
          chunkFileNames: "assets/chunk-[hash].js"
        }
      }
    },
    plugins: [crx({ manifest: manifest_default }), react()]
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL21hbmlmZXN0LnRzIiwgInBhY2thZ2UuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9kYXZpZG5vcm1hbi9IeXBlcmNhdGNoZXIvaHlwZXJjYXRjaGVyLWV4dGVuc2lvbi9oeXBlcmNhdGNoZXItZXh0ZW5zaW9uXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvZGF2aWRub3JtYW4vSHlwZXJjYXRjaGVyL2h5cGVyY2F0Y2hlci1leHRlbnNpb24vaHlwZXJjYXRjaGVyLWV4dGVuc2lvbi92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvZGF2aWRub3JtYW4vSHlwZXJjYXRjaGVyL2h5cGVyY2F0Y2hlci1leHRlbnNpb24vaHlwZXJjYXRjaGVyLWV4dGVuc2lvbi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgeyBjcnggfSBmcm9tICdAY3J4anMvdml0ZS1wbHVnaW4nXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5cbmltcG9ydCBtYW5pZmVzdCBmcm9tICcuL3NyYy9tYW5pZmVzdCdcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgcmV0dXJuIHtcbiAgICBidWlsZDoge1xuICAgICAgZW1wdHlPdXREaXI6IHRydWUsXG4gICAgICBvdXREaXI6ICdidWlsZCcsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL2NodW5rLVtoYXNoXS5qcycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG5cbiAgICBwbHVnaW5zOiBbY3J4KHsgbWFuaWZlc3QgfSksIHJlYWN0KCldLFxuICB9XG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZGF2aWRub3JtYW4vSHlwZXJjYXRjaGVyL2h5cGVyY2F0Y2hlci1leHRlbnNpb24vaHlwZXJjYXRjaGVyLWV4dGVuc2lvbi9zcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9kYXZpZG5vcm1hbi9IeXBlcmNhdGNoZXIvaHlwZXJjYXRjaGVyLWV4dGVuc2lvbi9oeXBlcmNhdGNoZXItZXh0ZW5zaW9uL3NyYy9tYW5pZmVzdC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvZGF2aWRub3JtYW4vSHlwZXJjYXRjaGVyL2h5cGVyY2F0Y2hlci1leHRlbnNpb24vaHlwZXJjYXRjaGVyLWV4dGVuc2lvbi9zcmMvbWFuaWZlc3QudHNcIjtpbXBvcnQgeyBkZWZpbmVNYW5pZmVzdCB9IGZyb20gJ0Bjcnhqcy92aXRlLXBsdWdpbidcbmltcG9ydCBwYWNrYWdlRGF0YSBmcm9tICcuLi9wYWNrYWdlLmpzb24nXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZU1hbmlmZXN0KHtcbiAgbmFtZTogcGFja2FnZURhdGEubmFtZSxcbiAgZGVzY3JpcHRpb246IHBhY2thZ2VEYXRhLmRlc2NyaXB0aW9uLFxuICB2ZXJzaW9uOiBwYWNrYWdlRGF0YS52ZXJzaW9uLFxuICBtYW5pZmVzdF92ZXJzaW9uOiAzLFxuICBpY29uczoge1xuICAgIDE2OiAnaW1nL2xvZ28tMTYucG5nJyxcbiAgICAzMjogJ2ltZy9sb2dvLTM0LnBuZycsXG4gICAgNDg6ICdpbWcvbG9nby00OC5wbmcnLFxuICAgIDEyODogJ2ltZy9sb2dvLTEyOC5wbmcnLFxuICB9LFxuICBhY3Rpb246IHtcbiAgICBkZWZhdWx0X3BvcHVwOiAncG9wdXAuaHRtbCcsXG4gICAgZGVmYXVsdF9pY29uOiAnaW1nL2xvZ28tNDgucG5nJyxcbiAgfSxcbiAgLy8gb3B0aW9uc19wYWdlOiAnb3B0aW9ucy5odG1sJyxcbiAgLy8gZGV2dG9vbHNfcGFnZTogJ2RldnRvb2xzLmh0bWwnLFxuICBiYWNrZ3JvdW5kOiB7XG4gICAgc2VydmljZV93b3JrZXI6ICdzcmMvYmFja2dyb3VuZC9pbmRleC50cycsXG4gICAgdHlwZTogJ21vZHVsZScsXG4gIH0sXG4gIGNvbnRlbnRfc2NyaXB0czogW1xuICAgIHtcbiAgICAgIG1hdGNoZXM6IFtcbiAgICAgICAgXCIqOi8vKi5yc3NibHVlLmNvbS8qXCIsXG4gICAgICAgIFwiKjovL3BvZGNhc3RlcnMuc3BvdGlmeS5jb20vKlwiLFxuICAgICAgICBcIio6Ly8qLmJ1enpzcHJvdXQuY29tLypcIixcbiAgICAgICAgXCIqOi8vcHVibGlzaC5ibHVicnJ5LmNvbS8qXCJcbiAgICAgIF0sXG4gICAgICBqczogW1wic3JjL2NvbnRlbnRTY3JpcHQvaGNpbmRleC50c1wiXVxuICAgIH1cbiAgXSxcbiAgLy8gc2lkZV9wYW5lbDoge1xuICAvLyAgIGRlZmF1bHRfcGF0aDogJ3NpZGVwYW5lbC5odG1sJyxcbiAgLy8gfSxcbiAgd2ViX2FjY2Vzc2libGVfcmVzb3VyY2VzOiBbXG4gICAge1xuICAgICAgcmVzb3VyY2VzOiBbJ2ltZy9sb2dvLTE2LnBuZycsICdpbWcvbG9nby0zNC5wbmcnLCAnaW1nL2xvZ28tNDgucG5nJywgJ2ltZy9sb2dvLTEyOC5wbmcnXSxcbiAgICAgIG1hdGNoZXM6IFtdLFxuICAgIH0sXG4gIF0sXG4gIHBlcm1pc3Npb25zOiBbJ3N0b3JhZ2UnLCAnYWN0aXZlVGFiJywgJ3RhYnMnLCAnY29udGV4dE1lbnVzJywgJ25vdGlmaWNhdGlvbnMnXSwgLy8gJ3NpZGVQYW5lbCdcbn0pXG4iLCAie1xuICBcIm5hbWVcIjogXCJIeXBlcmNhdGNoZXItQ2hhcHRlclN5bmNcIixcbiAgXCJkaXNwbGF5TmFtZVwiOiBcIkh5cGVyY2F0Y2hlciBFeHRlbnNpb25cIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4wLjVcIixcbiAgXCJhdXRob3JcIjogXCJEYXZpZCBOb3JtYW5cIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwiaHlwZXJjYXRjaGVyXCIsXG4gICAgXCJwb2RjYXN0XCIsXG4gICAgXCJjaGFwdGVyc1wiXG4gIF0sXG4gIFwiZW5naW5lc1wiOiB7XG4gICAgXCJub2RlXCI6IFwiPj0xNC4xOC4wXCJcbiAgfSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImRldlwiOiBcInZpdGVcIixcbiAgICBcImJ1aWxkXCI6IFwidHNjICYmIHZpdGUgYnVpbGRcIixcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXdcIixcbiAgICBcImZtdFwiOiBcInByZXR0aWVyIC0td3JpdGUgJyoqLyoue3RzeCx0cyxqc29uLGNzcyxzY3NzLG1kfSdcIixcbiAgICBcIndhdGNoXCI6IFwiLi93YXRjaC1hbmQtYnVpbGQuc2hcIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJyZWFjdFwiOiBcIl4xOC4yLjBcIixcbiAgICBcInJlYWN0LWRvbVwiOiBcIl4xOC4yLjBcIlxuICB9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAY3J4anMvdml0ZS1wbHVnaW5cIjogXCJeMi4wLjAtYmV0YS4xOVwiLFxuICAgIFwiQHR5cGVzL2Nocm9tZVwiOiBcIl4wLjAuMjQ2XCIsXG4gICAgXCJAdHlwZXMvcmVhY3RcIjogXCJeMTguMi4yOFwiLFxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIl4xOC4yLjEzXCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiOiBcIl40LjEuMFwiLFxuICAgIFwicHJldHRpZXJcIjogXCJeMy4wLjNcIixcbiAgICBcInR5cGVzY3JpcHRcIjogXCJeNS4yLjJcIixcbiAgICBcInZpdGVcIjogXCJeNC40LjExXCJcbiAgfVxufSJdLAogICJtYXBwaW5ncyI6ICI7QUFBeVosU0FBUyxvQkFBb0I7QUFDdGIsU0FBUyxXQUFXO0FBQ3BCLE9BQU8sV0FBVzs7O0FDRjZZLFNBQVMsc0JBQXNCOzs7QUNBOWI7QUFBQSxFQUNFLE1BQVE7QUFBQSxFQUNSLGFBQWU7QUFBQSxFQUNmLFNBQVc7QUFBQSxFQUNYLFFBQVU7QUFBQSxFQUNWLGFBQWU7QUFBQSxFQUNmLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxFQUNYLFVBQVk7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFXO0FBQUEsSUFDVCxNQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsU0FBVztBQUFBLElBQ1QsS0FBTztBQUFBLElBQ1AsT0FBUztBQUFBLElBQ1QsU0FBVztBQUFBLElBQ1gsS0FBTztBQUFBLElBQ1AsT0FBUztBQUFBLEVBQ1g7QUFBQSxFQUNBLGNBQWdCO0FBQUEsSUFDZCxPQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsRUFDZjtBQUFBLEVBQ0EsaUJBQW1CO0FBQUEsSUFDakIsc0JBQXNCO0FBQUEsSUFDdEIsaUJBQWlCO0FBQUEsSUFDakIsZ0JBQWdCO0FBQUEsSUFDaEIsb0JBQW9CO0FBQUEsSUFDcEIsd0JBQXdCO0FBQUEsSUFDeEIsVUFBWTtBQUFBLElBQ1osWUFBYztBQUFBLElBQ2QsTUFBUTtBQUFBLEVBQ1Y7QUFDRjs7O0FEbENBLElBQU8sbUJBQVEsZUFBZTtBQUFBLEVBQzVCLE1BQU0sZ0JBQVk7QUFBQSxFQUNsQixhQUFhLGdCQUFZO0FBQUEsRUFDekIsU0FBUyxnQkFBWTtBQUFBLEVBQ3JCLGtCQUFrQjtBQUFBLEVBQ2xCLE9BQU87QUFBQSxJQUNMLElBQUk7QUFBQSxJQUNKLElBQUk7QUFBQSxJQUNKLElBQUk7QUFBQSxJQUNKLEtBQUs7QUFBQSxFQUNQO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixlQUFlO0FBQUEsSUFDZixjQUFjO0FBQUEsRUFDaEI7QUFBQTtBQUFBO0FBQUEsRUFHQSxZQUFZO0FBQUEsSUFDVixnQkFBZ0I7QUFBQSxJQUNoQixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsaUJBQWlCO0FBQUEsSUFDZjtBQUFBLE1BQ0UsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxJQUFJLENBQUMsOEJBQThCO0FBQUEsSUFDckM7QUFBQSxFQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSwwQkFBMEI7QUFBQSxJQUN4QjtBQUFBLE1BQ0UsV0FBVyxDQUFDLG1CQUFtQixtQkFBbUIsbUJBQW1CLGtCQUFrQjtBQUFBLE1BQ3ZGLFNBQVMsQ0FBQztBQUFBLElBQ1o7QUFBQSxFQUNGO0FBQUEsRUFDQSxhQUFhLENBQUMsV0FBVyxhQUFhLFFBQVEsZ0JBQWdCLGVBQWU7QUFBQTtBQUMvRSxDQUFDOzs7QUR0Q0QsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsU0FBTztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0wsYUFBYTtBQUFBLE1BQ2IsUUFBUTtBQUFBLE1BQ1IsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sZ0JBQWdCO0FBQUEsUUFDbEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBRUEsU0FBUyxDQUFDLElBQUksRUFBRSwyQkFBUyxDQUFDLEdBQUcsTUFBTSxDQUFDO0FBQUEsRUFDdEM7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

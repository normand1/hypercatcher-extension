#!/bin/bash
while true; do
    watchman-wait . -p 'src/**/*'
    npm run build
done

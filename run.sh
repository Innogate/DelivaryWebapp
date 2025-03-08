# Check if node_modules directory exists
if [ ! -d "node_modules" ]; then
    echo "Installing node_modules..."
    npm install
fi

ng serve --host 0.0.0.0 --port 4200 --disable-host-check 

echo "Done"
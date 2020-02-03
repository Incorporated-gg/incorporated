INITIAL_PATH=$(pwd)
# Update server
cd $INITIAL_PATH/packages/game-server
npm i
npm run migrate_prod
pm2 reload all
# Update client
cd $INITIAL_PATH/packages/game-client
npm i
npm run build
mkdir -p build_nginx
cp -r build/* build_nginx/
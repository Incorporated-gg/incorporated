INITIAL_PATH=$(pwd)
# Update server
cd $INITIAL_PATH/packages/game_server
npm i
npm run migrate_prod
pm2 reload all
# Update client
cd $INITIAL_PATH/packages/game_client
npm i
npm run build
mkdir -p build_nginx
cp -r build/* build_nginx/
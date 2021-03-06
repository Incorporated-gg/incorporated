INITIAL_PATH=$(pwd)

# Update shared-lib
cd $INITIAL_PATH/packages/shared-lib
npm i
npm run build
# Update account-server
cd $INITIAL_PATH/packages/account-server
npm i
npm run migrate_prod
# Update game-server
cd $INITIAL_PATH/packages/game-server
npm i
npm run migrate_prod
# Reload servers
pm2 reload all
# Update game-client
cd $INITIAL_PATH/packages/game-client
npm i
npm run build
mkdir -p build_nginx
cp -r build/* build_nginx/
# Update admin-client
cd $INITIAL_PATH/packages/admin-client
npm i
npm run build
mkdir -p build_nginx
cp -r dist/* build_nginx/

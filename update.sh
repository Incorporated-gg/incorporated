INITIAL_PATH=$(pwd)

# Update account-server
cd $INITIAL_PATH/packages/account-server
npm i
npm run migrate_prod
npm run tsc
pm2 reload all
# Update game-server
cd $INITIAL_PATH/packages/game-server
npm i
npm run migrate_prod
pm2 reload all
# Update game-client
cd $INITIAL_PATH/packages/game-client
npm i
npm run build
mkdir -p build_nginx
cp -r build/* build_nginx/

INITIAL_PATH=$(pwd)
# Update server
cd $INITIAL_PATH/server
npm i
pm2 reload all
npm run migrate
# Run unit tests
cd $INITIAL_PATH/shared-lib
npm run test
# Update client
cd $INITIAL_PATH/client
npm i
npm run build
mkdir -p build_nginx
cp -r build/* build_nginx/
INITIAL_PATH=$(pwd)
# Update server
cd $INITIAL_PATH/server
npm i
pm2 reload all
npm run migrate
# Update client
cd $INITIAL_PATH/client
npm i
npm run build

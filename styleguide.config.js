module.exports = {                        
 webpackConfig: {                           
   module: {                           
     rules: [                               
     {                                    
        test: /\.jsx?$/,                                 
        exclude: /node_modules/,                                 
        loader: "babel-loader",
        options: {
         presets: ["@babel/preset-env", "@babel/preset-react"],
         plugins: ["@babel/plugin-proposal-class-properties"]
        }             
     }         
    ]                           
 }                         
},                      
};

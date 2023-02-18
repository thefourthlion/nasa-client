#!/usr/bin/env python3
from pathlib import Path

import os

def writeToFile(path, content):
  file = open(path, "w")
  file.write(content)
  file.close()
  
def writeToBeginningOfFile(path, content):
  read_file = open(path, "r")
  file_content = read_file.read()
  read_file.close()
  file = open(path, "w")
  file_content = content + file_content 
  file.seek(0)
  file.write(file_content)
  file.close()

# ----------------------------------------- Set according to directory  ----------------------------
# ----------------------------------------- 🛑🛑 run code from directory 🛑🛑  ----------------------------
current_path = (Path.cwd())
print(Path.cwd())
component_folder = "components"
page_folder = "pages"
style_folder = "styles"
public_folder = "public"
images_folder = "images"

component_directory = os.path.join(current_path, component_folder)
page_directory = os.path.join(current_path, page_folder)
styles_directory = os.path.join(current_path, style_folder)
public_directory = os.path.join(current_path, public_folder)
images_directory = os.path.join(current_path, images_folder)

component_path = './components/'
page_path = './pages/'
style_path = "./styles/"
public_path = "./public/"
images_path = "./public/images"

def create_paths():
  # ----------------------------------------- Create component directory ----------------------------
  if os.path.exists(component_path):
    print("⭐ Component path exists.")
  else:
    print("✅ Components directory created.")
    os.mkdir(component_path)
  # ----------------------------------------- Create pages directory ----------------------------
  if os.path.exists(page_path):
    print("⭐ Page path exists.")
  else:
    print("✅ Page directory created.")
    os.mkdir(page_path)
  # ----------------------------------------- Create styles directory ----------------------------
  if os.path.exists(style_path):
    print("⭐ Style path exists.")
  else:
    print("✅ Style directory created.")
    os.mkdir(style_path)
  # ----------------------------------------- Create public directory ----------------------------
  if os.path.exists(public_path):
    print("⭐ Public path exists.")
  else:
    print("✅ Public directory created.")
    os.mkdir(public_path)
  # ----------------------------------------- Create public directory ----------------------------
  if os.path.exists(images_path):
    print("⭐ Images path exists.")
  else:
    print("✅ Images directory created.")
    os.mkdir(images_path)


def create_pages(page_name):
  # ----------------------------------------- page path and content ----------------------------
  page_style_path = f"{styles_directory}/{page_name}.scss"
  styles_content = f".{page_name}" + "{}"
  page_file_path = f"{page_directory}/{page_name}.js"
  page_content = 'import React from "react"; const '+page_name+' = () => { return ( <div className="'+page_name+'"> <div className="container"> <h1 className="content-header">'+page_name+'</h1> </div> </div> ); }; export default '+page_name+';'
  styles_import = f'import "../styles/{page_name}.scss";'
  # ----------------------------------------- Create page if it doesn't exist ------------------
  if os.path.exists(page_file_path):
    print("⭐ This page already exists")
  else:
    print("✅ Page js file created.")
    writeToFile(page_file_path, page_content)
    writeToFile(page_style_path, styles_content)
    print("✅ Scss added to page.")
    writeToBeginningOfFile(f"{page_path}/_app.js", styles_import)
    
    
def create_components(folder_name, component_name):
  # ----------------------------------------- Create styles for component ----------------------
  component_style_path = f"{styles_directory}/{component_name}.scss"
  component_style_folder_path = f"{component_directory}/{folder_name}/{component_name}.scss"
  styles_content = f".{component_name}" + "{}"
  styles_import = f'import "../styles/{component_name}.scss";'
  # ----------------------------------------- component path and content ----------------------------
  component_file_path = f"{component_directory}/{component_name}.js"
  component_file_folder_path = f"{component_directory}/{folder_name}/{component_name}.js"
  component_content = 'import React from "react"; const '+component_name+' = () => { return ( <div className="'+component_name+'"> <div className="container"> <h1 className="content-header">'+component_name+'</h1> </div> </div> ); }; export default '+component_name+';'
  # ----------------------------------------- create component if it doesn't exist ----------------------------
  if os.path.exists(f"{component_directory}/{folder_name}/"):
    print("⭐ The component folder already exists")
  else:
    print("✅ Component folder created.")
    os.mkdir(f"{component_directory}/{folder_name}/")
  # ----------------------------------------- put it in page folder if necessary ----------------------------
  if(folder_name != ""):    
    if os.path.exists(component_file_folder_path):
      print("⭐ This component already exists")
    else:
      print("✅ Component js file created.")
      writeToFile(component_file_folder_path, component_content)
      writeToFile(component_style_folder_path, styles_content)
      writeToBeginningOfFile(f"{page_path}/_app.js", styles_import)
  else:
    if os.path.exists(component_file_path):
      print("⭐ This component already exists")
    else:
      print("✅ Component js file created.")
      writeToFile(component_file_path, component_content)
      writeToFile(component_style_path, styles_content)
      writeToBeginningOfFile(f"{page_path}/_app.js", styles_import)

def create_git_ignore():
  git_ignore_file_path = f"{current_path}/.gitignore"
  git_ignore_content = ".env\n./firebase.js\n/node_modules\n/.pnp\n.pnp.js\n/coverage\n/.next/\n/out/\n/build\n.DS_Store\n*.pem\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n.pnpm-debug.log*\n.env*.local\n.vercel\n*.tsbuildinfo\nnext-env.d.ts"
  if os.path.exists(f"{current_path}/.gitignore"):
    print("⭐ The git ignore already exists")
  else:
    print("✅ Git ignore file created.")
    writeToFile(git_ignore_file_path, git_ignore_content)
    
def create_app_yml():
  app_yml_file_path = f"{current_path}/app.yml"
  app_yml_content = 'apps: - script: ./server.js cwd: /home/application/client/ name: "application" interpreter: /usr/bin/node'
  if os.path.exists(f"{current_path}/app.yml"):
    print("⭐ The app yml already exists")
  else:
    print("✅ app yml file created.")
    writeToFile(app_yml_file_path, app_yml_content)
    
def create_next_server():
  next_server_file_path = f"{current_path}/server.js"
  next_server_content = 'const { createServer } = require("http"); const { parse } = require("url"); const next = require("next"); const dev = process.env.NODE_ENV !== "production"; const hostname = "localhost"; const port = process.env.PORT || 3002; const app = next({ dev, hostname, port }); const handle = app.getRequestHandler(); app.prepare().then(() => { createServer(async (req, res) => { try { const parsedUrl = parse(req.url, true); const { pathname, query } = parsedUrl; if (pathname === "/a") { await app.render(req, res, "/a", query); } else if (pathname === "/b") { await app.render(req, res, "/b", query); } else { await handle(req, res, parsedUrl); } } catch (err) { console.error("Error occurred handling", req.url, err); res.statusCode = 500; res.end("internal server error"); } }).listen(port, (err) => { if (err) throw err; console.log(`> Ready on http://${hostname}:${port}`); }); }); '
  if os.path.exists(f"{current_path}/server.js"):
    print("⭐ The next server already exists")
  else:
    print("✅ next server file created.")
    writeToFile(next_server_file_path, next_server_content)

def create_sitemap_generator():
  sitemap_file_path = f"{current_path}/site-map-generator.js"
  sitemap_content = 'const sitemap = require("nextjs-sitemap-generator"); sitemap({ baseUrl: "https://twainharteace.com/", ignoredPaths: ["admin", "login"], ignoredExtensions: [ "js", "map", "json", "png", "jpeg", "jpg", "svg", "icon", "mp4", ], extraPaths: ["/extraPath"], pagesDirectory: __dirname + "/.next/server/pages", targetDirectory: "public/", sitemapFilename: "sitemap.xml", nextConfigPath: __dirname + "/next.config.js", }); '
  if os.path.exists(f"{current_path}/site-map-generator.js"):
      print("⭐ The site map already exists")
  else:
    print("✅ site map file created.")
    writeToFile(sitemap_file_path, sitemap_content)

def create_next_config():
  next_config_path = f"{current_path}/next.config.js"
  next_config_content = 'module.exports = { reactStrictMode: true, swcMinify: true, webpack(config) { config.module.rules.push({ test: /\.svg$/i, issuer: /\.[jt]sx?$/, use: ["@svgr/webpack"], }); return config; }, };'
  if os.path.exists(f"{current_path}/next.config.js"):
    print("⭐ The next config already exists")
  else:
    print("✅ next config file created.")
    writeToFile(next_config_path, next_config_content)
    
def create_package_json():
  package_json_path = f"{current_path}/package.json"
  package_json_content = '{ "name": "next", "version": "0.1.0", "private": true, "scripts": { "dev": "next dev", "build": "next build", "start": "next start", "lint": "next lint" }, "dependencies": { "@firebase/auth": "^0.20.11", "axios": "^1.1.3", "bootstrap": "^5.2.2", "firebase": "^9.13.0", "next": "13.0.0", "react": "18.2.0", "react-bootstrap": "^2.5.0", "react-dom": "18.2.0", "react-router-dom": "^6.4.3", "sass": "^1.55.0" }, "devDependencies": { "eslint": "8.26.0", "eslint-config-next": "13.0.0" } } '
  if os.path.exists(f"{current_path}/package.json"):
    print("⭐ The package.json already exists")
  else:
    print("✅ package.json file created.")
    writeToFile(package_json_path, package_json_content)
    
def create_index_page():
  index_style_path = f"{style_path}/index.scss"
  index_style_content = ".Home{}"
  index_page_path = f"{page_path}/index.js"
  index_page_content = 'export default function Home() { return <div className="Home"></div>; } '
  if os.path.exists(f"{page_path}/index.js"):
    print("⭐ The index.js already exists")
  else:
    print("✅ index.js file created.")
    writeToFile(index_page_path, index_page_content)
    print("✅ index.scss file created.")
    writeToFile(index_style_path, index_style_content)
    
def create_app_page():
  app_style_path = f"{style_path}/globals.scss"
  app_style_content = ".Home{}"
  app_page_path = f"{page_path}/_app.js"
  app_page_content = 'import "../styles/globals.scss"; function MyApp({ Component, pageProps }) { return <Component {...pageProps} />; } export default MyApp; '
  if os.path.exists(f"{page_path}/_app.js"):
    print("⭐ The app.js already exists")
  else:
    print("✅ app.js file created.")
    writeToFile(app_page_path, app_page_content)
    print("✅ app.scss file created.")
    writeToFile(app_style_path, app_style_content)
    
    
    
create_paths()
create_git_ignore()
create_next_server()
create_app_yml()
create_sitemap_generator()
create_next_config()
create_package_json()
create_index_page()
create_app_page()
# create_components("component","componentPreview")
# create_pages("whatever")

create_page = input("Would you like to create a page? [Y or N]")
while(create_page.lower() == "y"):
  page_name = input("What would you like to call the page? [String}")
  create_pages(page_name)
  create_page = input("Would you like to create a page? [Y or N]")

create_component = input("Would you like to create a component? [Y or N]")
while(create_component.lower() == "y"):
  component_name = input("What would you like to call the component? [String}")
  create_components("", component_name)
  create_component = input("Would you like to create a component? [Y or N]")


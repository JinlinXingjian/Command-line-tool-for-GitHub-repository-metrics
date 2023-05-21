const axios = require('axios');
const { DateTime } = require('luxon');

async function getRepositoryInfo(repo) {
  const token = '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';
  const headers = { 'Authorization': `Token ${token}` };
  const url = `https://api.github.com/repos/${repo}`;
  console.log('开始请求', repo, '仓库的数据...');

  try {
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      const data = response.data;

      return {
        name: data.name,
        html_url: data.html_url,
        stargazers_count: data.stargazers_count,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('请求错误:', error);
    return null;
  }
}

async function getCommitCount(repo, year, month) {
  const token = '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';
  const headers = { 'Authorization': `Token ${token}` };
  const base_url = `https://api.github.com/repos/${repo}/commits`;
  const since = `${year}-${month.toString().padStart(2, '0')}-01T00:00:00Z`;
  const until = `${year}-${month.toString().padStart(2, '0')}-31T23:59:59Z`;
  const params = {
    since,
    until,
    per_page: 100
  };
  const proxies = { "http": null, "https": null };
  console.log('开始请求', repo, '仓库在', year, '年', month, '月的commit数据...');

  try {
    const response = await axios.get(base_url, { params, proxies, headers });

    if (response.status === 200) {
      const commits = response.data;
      const commit_count = commits.length;

      return commit_count;
    } else {
      return 0;
    }
  } catch (error) {
    console.error('请求错误:', error);
    return 0;
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.log('请提供仓库地址');
    process.exit(1);
  }

  const repo_url = process.argv[2];
  const current_date = DateTime.now();
  const current_month = current_date.month;
  const current_year = current_date.year;
  const month_list = [];

  const repositoryInfo = await getRepositoryInfo(repo_url);

  if (repositoryInfo) {
    console.log('仓库URL:', repositoryInfo.html_url);
    console.log('仓库名:', repositoryInfo.name);
    console.log('仓库收藏数量:', repositoryInfo.stargazers_count);
    console.log('仓库创建时间:', repositoryInfo.created_at);
    console.log('最近更新:', repositoryInfo.updated_at);

    let totalCommitCount = 0;
    for (let i = 0; i < 5; i++) {
      let year = current_year;
      let month = current_month - i;
      if (month <= 0) {
        month += 12;
        year--;
      }

      const commitCount = await getCommitCount(repo_url, year, month);
      console.log(`${year}年${month}月的commit次数：`, commitCount);
      totalCommitCount += commitCount;
    }

    console.log('最近五个月的总commit次数:', totalCommitCount);
  }
}

main().catch(error => {
  console.error('发生错误:', error);
  process.exit(1);
});
